import unittest

from app.ml.emotion_data import ALL_EMOTIONS
from app.ml.gureum import classify_emotions


class EmotionClassifierTest(unittest.TestCase):
    def labels_for(self, text: str) -> set[str]:
        prediction = classify_emotions(text)
        return {emotion.label for emotion in prediction.emotions}

    def test_all_twenty_one_emotions_are_defined(self) -> None:
        self.assertEqual(21, len(ALL_EMOTIONS))

    def test_frustrated_sentence_has_multiple_labels(self) -> None:
        labels = self.labels_for("진짜 짜증나고 답답해")
        self.assertIn("분노", labels)
        self.assertIn("답답함", labels)

    def test_short_frustrated_sentence_has_multiple_labels(self) -> None:
        labels = self.labels_for("짜증나")
        self.assertIn("분노", labels)
        self.assertIn("답답함", labels)

    def test_positive_compound_emotions(self) -> None:
        labels = self.labels_for("합격해서 너무 기쁘고 뿌듯해")
        self.assertIn("기쁨", labels)
        self.assertIn("뿌듯함", labels)

    def test_self_blame_emotion(self) -> None:
        labels = self.labels_for("다 내 잘못이야 내가 망쳤어")
        self.assertIn("자책감", labels)

    def test_neutral_sentence(self) -> None:
        labels = self.labels_for("회의는 세 시에 시작해")
        self.assertEqual({"중립"}, labels)


if __name__ == "__main__":
    unittest.main()
