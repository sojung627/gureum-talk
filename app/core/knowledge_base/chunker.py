import re
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class MarkdownChunk:
    """임베딩과 검색에 사용할 마크다운 청크"""

    chunk_index: int
    title: str
    content: str
    source: str


HEADING_PATTERN = re.compile(r"^(#{1,6})\s+(.+?)\s*$")


def _split_long_section(
        title: str,
        section_lines: list[str],
        max_characters: int,
) -> list[str]:
    """긴 섹션을 문단 단위로 나누되 제목 문맥을 각 청크에 유지"""
    section_text = "\n".join(section_lines).strip()
    content_with_title = f"## {title}\n\n{section_text}"
    if len(content_with_title) <= max_characters:
        return [content_with_title]

    paragraphs = [
        paragraph.strip()
        for paragraph in re.split(r"\n\s*\n", section_text)
        if paragraph.strip()
    ]
    chunks: list[str] = []
    current_paragraphs: list[str] = []

    for paragraph in paragraphs:
        candidate_parts = [f"## {title}", *current_paragraphs, paragraph]
        candidate = "\n\n".join(candidate_parts)

        if current_paragraphs and len(candidate) > max_characters:
            chunks.append(
                "\n\n".join([f"## {title}", *current_paragraphs])
            )
            current_paragraphs = [paragraph]
        else:
            current_paragraphs.append(paragraph)

    if current_paragraphs:
        chunks.append(
            "\n\n".join([f"## {title}", *current_paragraphs])
        )

    return chunks


def split_markdown(
        markdown_text: str,
        source: str,
        max_characters: int = 1200,
) -> list[MarkdownChunk]:
    """마크다운을 2단계 제목 기준으로 분리하고 긴 섹션만 추가 분할"""
    if max_characters < 200:
        raise ValueError("max_characters는 200 이상이어야 합니다.")

    document_title = "구름톡 서비스 안내"
    section_title = document_title
    section_lines: list[str] = []
    sections: list[tuple[str, list[str]]] = []

    for line in markdown_text.splitlines():
        heading_match = HEADING_PATTERN.match(line)
        if heading_match and len(heading_match.group(1)) == 1:
            document_title = heading_match.group(2).strip()
            if not section_lines:
                section_title = document_title
            continue

        if heading_match and len(heading_match.group(1)) == 2:
            if section_lines:
                sections.append((section_title, section_lines))
            section_title = heading_match.group(2).strip()
            section_lines = []
            continue

        if line.strip() or section_lines:
            section_lines.append(line)

    if section_lines:
        sections.append((section_title, section_lines))

    chunks: list[MarkdownChunk] = []
    for title, lines in sections:
        section_chunks = _split_long_section(
            title=title,
            section_lines=lines,
            max_characters=max_characters,
        )
        for content in section_chunks:
            normalized_content = content.strip()
            if not normalized_content:
                continue

            chunks.append(
                MarkdownChunk(
                    chunk_index=len(chunks),
                    title=title,
                    content=(
                        f"# {document_title}\n\n{normalized_content}"
                    ),
                    source=source,
                )
            )

    return chunks


def load_and_split_markdown(
        markdown_path: Path,
        max_characters: int = 1200,
) -> list[MarkdownChunk]:
    """UTF-8 마크다운 파일을 읽어 검색용 청크로 변환"""
    markdown_text = markdown_path.read_text(encoding="utf-8")
    return split_markdown(
        markdown_text=markdown_text,
        source=markdown_path.name,
        max_characters=max_characters,
    )
