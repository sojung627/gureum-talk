from dataclasses import dataclass
from functools import lru_cache

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.multiclass import OneVsRestClassifier
from sklearn.preprocessing import MultiLabelBinarizer

from app.ml.emotion_data import (
    ALL_EMOTIONS,
    EMOTION_KEYWORDS,
    NEUTRAL_EMOTION,
    TRAINING_SAMPLES,
)


@dataclass(frozen=True)
class EmotionScore:
    # 감정 이름과 모델이 계산한 확률
    label: str
    score: float


@dataclass(frozen=True)
class EmotionPrediction:
    # 한 문장에 함께 나타난 최대 세 개의 감정
    emotions: tuple[EmotionScore, ...]

    @property
    def dominant_emotion(self) -> str:
        return self.emotions[0].label


class EmotionClassifier:
    """한국어 문장의 복합 감정을 분류하는 가벼운 CPU 모델."""

    minimum_score = 0.24
    relative_score_ratio = 0.75
    maximum_emotions = 3
    keyword_score_bonus = 0.18

    def __init__(self) -> None:
        training_texts = [text for text, _ in TRAINING_SAMPLES]
        training_labels = [labels for _, labels in TRAINING_SAMPLES]

        # 한국어는 조사와 어미가 자주 바뀌므로 단어보다 글자 묶음이 안정적이다.
        self.vectorizer = TfidfVectorizer(
            analyzer="char_wb",
            ngram_range=(2, 5),
            min_df=1,
            sublinear_tf=True,
        )
        training_vectors = self.vectorizer.fit_transform(training_texts)

        # 감정마다 독립적으로 예/아니오를 판단해 복합 감정을 허용한다.
        self.label_binarizer = MultiLabelBinarizer(classes=ALL_EMOTIONS)
        encoded_labels = self.label_binarizer.fit_transform(training_labels)
        self.model = OneVsRestClassifier(
            LogisticRegression(
                class_weight="balanced",
                max_iter=2000,
                random_state=42,
            )
        )
        self.model.fit(training_vectors, encoded_labels)

    def predict(self, text: str) -> EmotionPrediction:
        normalized_text = " ".join(text.strip().split())
        if not normalized_text:
            return self._neutral_prediction()

        text_vector = self.vectorizer.transform([normalized_text])
        probabilities = self.model.predict_proba(text_vector)[0]
        scores_by_emotion = {
            emotion: float(score)
            for emotion, score in zip(
                self.label_binarizer.classes_,
                probabilities,
                strict=True,
            )
        }
        keyword_matched_emotions = self._find_keyword_emotions(normalized_text)
        for emotion in keyword_matched_emotions:
            scores_by_emotion[emotion] = min(
                1.0,
                scores_by_emotion[emotion] + self.keyword_score_bonus,
            )

        neutral_score = scores_by_emotion[NEUTRAL_EMOTION]
        emotional_scores = sorted(
            (
                EmotionScore(label=emotion, score=score)
                for emotion, score in scores_by_emotion.items()
                if emotion != NEUTRAL_EMOTION
            ),
            key=lambda emotion_score: emotion_score.score,
            reverse=True,
        )
        strongest_emotion = emotional_scores[0]

        # 중립 확률이 가장 높고 다른 감정도 약하면 억지 분류를 하지 않는다.
        if (
            neutral_score >= strongest_emotion.score
            and strongest_emotion.score < 0.45
        ):
            return self._neutral_prediction(neutral_score)

        dynamic_threshold = max(
            self.minimum_score,
            strongest_emotion.score * self.relative_score_ratio,
        )
        selected_emotions = tuple(
            emotion_score
            for emotion_score in emotional_scores
            if (
                emotion_score.score >= dynamic_threshold
                or (
                    emotion_score.label in keyword_matched_emotions
                    and emotion_score.score >= self.minimum_score
                )
            )
        )[: self.maximum_emotions]

        if not selected_emotions:
            return self._neutral_prediction(neutral_score)

        return EmotionPrediction(emotions=selected_emotions)

    @staticmethod
    def _find_keyword_emotions(text: str) -> set[str]:
        matched_emotions = {
            emotion
            for emotion, keywords in EMOTION_KEYWORDS.items()
            if any(keyword in text for keyword in keywords)
        }
        # "희망이 없어"처럼 단어는 긍정이지만 문맥은 부정인 경우를 보정한다.
        hope_negations = (
            "희망도 없어",
            "희망이 없어",
            "희망은 없어",
            "희망 없다",
            "희망이 없",
        )
        if any(negation in text for negation in hope_negations):
            matched_emotions.discard("희망")

        return matched_emotions

    @staticmethod
    def _neutral_prediction(score: float = 1.0) -> EmotionPrediction:
        return EmotionPrediction(
            emotions=(
                EmotionScore(
                    label=NEUTRAL_EMOTION,
                    score=float(score),
                ),
            )
        )


@lru_cache(maxsize=1)
def get_emotion_classifier() -> EmotionClassifier:
    # 서버 실행 중 모델을 한 번만 학습해 요청마다 재학습하지 않는다.
    return EmotionClassifier()


def classify_emotions(text: str) -> EmotionPrediction:
    return get_emotion_classifier().predict(text)
