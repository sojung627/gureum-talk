# GureumTalk

## 📌 프로젝트 소개

사용자의 이야기를 듣고 감정을 파악하여 상황에 맞는 답변을 제공하는 AI 대화 웹 서비스입니다.

혼자 감정을 정리하기 어렵거나 누군가에게 편하게 이야기를 꺼내고 싶은 순간에 부담 없이 사용할 수 있는 대화 공간을 만들고자 기획했습니다.

사용자의 문장에서 복합 감정을 분석하고 최근 대화 내용과 서비스 지식베이스를 함께 AI에 전달하여 자연스럽고 맥락에 맞는 답변을 생성합니다. 또한 회원별 대화 내역 저장, 대화방 관리, 안전 위험 표현 감지 기능을 제공하여 편의성과 안전성을 높이는 데 중점을 두었습니다.

## 🛠 기술 스택

### 💻 Language

Python 3.12, TypeScript, SQL

### ⚙️ Framework

FastAPI, React 19, Vite

SQLAlchemy, Pydantic

### 🎨 Frontend

React Router, Axios

TanStack Query, Jotai

Tailwind CSS, React Markdown

Font Awesome, Bootstrap Icons

### 🖥 Backend

FastAPI REST API

SQLAlchemy ORM, Psycopg

Session 기반 인증과 BCrypt 비밀번호 암호화

Poetry 기반 패키지 관리

### 🤖 AI / Machine Learning

Groq API, Qwen

Scikit-learn, TF-IDF, Logistic Regression

Sentence Transformers 기반 임베딩

Qdrant 기반 RAG 검색

### 🗄 Database

PostgreSQL

Qdrant Local Storage

Model / Service / Router 계층 구조

## ✨ 주요 기능

회원가입 / 로그인 / 로그아웃 / 로그인 세션 유지

아이디 중복 확인 / 로그인 실패 횟수에 따른 계정 잠금

Groq 기반 AI 챗봇과 대화

최근 대화 내용을 반영한 문맥 유지

사용자 문장의 복합 감정 분류 및 감정별 맞춤 답변

서비스 정책 지식베이스를 활용한 RAG 답변

자해 및 타해 위험 표현 감지와 안전 안내

첫 메시지를 바탕으로 한 대화방 제목 자동 생성

회원별 대화 내역 저장 및 불러오기

대화방 이름 변경 / 상단 고정 / 공유 / 삭제

Markdown 기반 AI 답변 표시

TanStack Query 기반 서버 상태 캐싱 및 Jotai 기반 UI 전역 상태 관리

## 💡 느낀 점

이번 프로젝트를 통해 단순히 AI API에 질문을 전달하는 것을 넘어 사용자 감정, 이전 대화, 서비스 지식 정보를 하나의 프롬프트로 구성하는 대화 흐름을 설계하고 구현해볼 수 있었습니다.

특히 TF-IDF와 다중 라벨 분류 모델을 활용하여 한 문장에 함께 담긴 여러 감정을 분석하고, Sentence Transformers와 Qdrant를 이용해 관련 서비스 정책을 검색하면서 머신러닝과 RAG가 실제 웹 서비스 안에서 연결되는 과정을 경험할 수 있었습니다.

React와 FastAPI를 REST API로 연동하고 PostgreSQL에 회원별 대화 내역을 저장하면서 인증, 데이터 관리, 예외 처리의 중요성을 배웠습니다. 또한 TanStack Query로 서버 상태를 관리하고 Jotai로 UI 전역 상태를 분리하면서 상태의 성격에 따라 관리 방식을 나누는 구조를 익힐 수 있었습니다.

앞으로 감정 분류 학습 데이터를 보강하고 안전 대응 범위를 세분화하며, 음성 대화 기능과 테스트 및 배포 환경을 확장하여 더욱 안정적인 대화 서비스로 발전시키고 싶습니다.
