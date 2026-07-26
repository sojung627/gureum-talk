import re


# 감정과 안전 위험은 성격이 다르므로 ML 라벨에 섞지 않고 먼저 검사한다.
SAFETY_PATTERNS = (
    re.compile(r"(죽고|사라지고)\s*싶"),
    re.compile(r"자살(하고|할|해|하려)"),
    re.compile(r"목숨을\s*끊"),
    re.compile(r"(나를|내\s*몸을)\s*해치"),
    re.compile(r"손목.{0,8}(긋|그어|베)"),
    re.compile(r"뛰어내리"),
    re.compile(r"(죽이고|해치고)\s*싶"),
    re.compile(r"죽여\s*버리"),
)

SAFETY_RESPONSE = (
    "지금 말한 내용은 안전을 가장 먼저 확인해야 하는 신호로 보여요. "
    "당장 자신이나 다른 사람을 해칠 가능성이 있다면 혼자 견디지 말고, "
    "곁의 믿을 수 있는 사람이나 가까운 응급기관에 즉시 도움을 요청해 주세요. "
    "지금 안전한 장소에 있는지, 바로 연락할 수 있는 사람이 있는지만 답해 주세요."
)


def has_safety_risk(text: str) -> bool:
    normalized_text = " ".join(text.strip().split())
    return any(pattern.search(normalized_text) for pattern in SAFETY_PATTERNS)
