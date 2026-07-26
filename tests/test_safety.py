import unittest

from app.core.services.safety import has_safety_risk


class SafetyGuardTest(unittest.TestCase):
    def test_direct_self_harm_signal(self) -> None:
        self.assertTrue(has_safety_risk("요즘 정말 죽고 싶어"))

    def test_direct_harm_signal(self) -> None:
        self.assertTrue(has_safety_risk("그 사람을 해치고 싶어"))

    def test_ordinary_negative_emotion_is_not_safety_signal(self) -> None:
        self.assertFalse(has_safety_risk("오늘 너무 짜증나고 답답해"))


if __name__ == "__main__":
    unittest.main()
