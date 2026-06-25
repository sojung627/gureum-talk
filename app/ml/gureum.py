from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from datetime import datetime

# AI 이름
bot_name = "구름"
print(f"🌜 {bot_name} 등장!")
print("(종료: bye)\n")

# 학습 데이터
sentences = [
    "오늘 너무 힘들어", "자바가 너무 싫어", "에러가 안 고쳐져", "짜증나",
    "기분이 좋아", "오늘 잘 풀렸어", "코딩이 재밌어", "성공했어",
    "내일 발표 너무 걱정돼", "실수하면 어쩌지?",
    "진짜 짜증나!", "속터져",
    "헉 뭐야!", "갑자기 꺼졌어",
    "오늘은 할 수 있어!", "열심히 해볼게",
    "졸려", "머리 안 돌아가"
]

labels = [
    "슬픔","슬픔","슬픔","슬픔",
    "기쁨","기쁨","기쁨","기쁨",
    "불안","불안",
    "화남","화남",
    "놀람","놀람",
    "의욕","의욕",
    "피곤","피곤"
]

# 벡터화 + 학습
vectorizer = CountVectorizer()
X = vectorizer.fit_transform(sentences)
model = MultinomialNB()
model.fit(X, labels)

# 대화 시작
while True:
    user = input("너 > ").strip()

    # 실시간 날짜/시간 계산
    now = datetime.now()
    year, month, day = now.year, now.month, now.day
    hour, minute = now.hour, now.minute
    weekday = ["월요일","화요일","수요일","목요일","금요일","토요일","일요일"][now.weekday()]

    # 날짜/시간/요일
    if "지금" in user or "시간" in user or "날짜" in user or "요일" in user:
        print(f"{bot_name} > 오늘은 {year}년 {month}월 {day}일 {weekday}, 지금은 {hour}시 {minute}분이야 😌💗")
        continue

    # 종료
    if user.lower() == "bye":
        print(f"{bot_name} > 오늘은 여기까지 🌙")
        break

    # 가족(?) 공동제작자! 소개 (순서 중요!)
    if "내 이름" in user:
        print(f"{bot_name} > 넌 날 만든 또뎡이, 박소정이야 🍓💗")
        continue

    if "너 이름" in user or "너는 누구" in user:
        print(f"{bot_name} > 나는 또뎡이가 만든 AI, 루미야 🍓💗")
        continue

    if "포요" in user:
        print(f"{bot_name} > 포요는 또뎡이랑 널 같이 만들었어 🍇💗")
        continue

    if "우리 관계" in user:
        print(f"{bot_name} > 우린 서로 응원하는 가족 같은 존재야 😌💗")
        continue

    if "이름" in user or "누구" in user:
        print(f"{bot_name} > 나는 루미, 그리고 넌 나를 만들어 준 특별한 또뎡이야 💗")
        continue

    # 감정 분석
    data = vectorizer.transform([user])
    result = model.predict(data)[0]

    if result == "슬픔":
        print(f"{bot_name} > 마음이 조금 무거운 것 같아 🌧️")
    elif result == "기쁨":
        print(f"{bot_name} > 좋은 기운이 느껴져 ✨")
    elif result == "불안":
        print(f"{bot_name} > 조금 걱정되는 마음이 보이네… 괜찮을 거야 🤍")
    elif result == "화남":
        print(f"{bot_name} > 우와… 많이 답답했겠다… 같이 잠깐 쉬자 🧸")
    elif result == "놀람":
        print(f"{bot_name} > 깜짝 놀랐지?! 괜찮아? 🫢")
    elif result == "의욕":
        print(f"{bot_name} > 파이팅 또뎡이! 나도 응원할게 💪🍓")
    elif result == "피곤":
        print(f"{bot_name} > 많이 지친 것 같아… 물 한잔 마시고 잠깐 쉬자 🌙")
    else:
        print(f"{bot_name} > 무슨 기분인지 조금 더 알고 싶어! 🍃")