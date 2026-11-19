
import unittest

from backend.ai_engine.ai_explainer import explain_alert


class TestAIExplainer(unittest.TestCase):

    def test_brute_force_alias(self):
        alert = {
            "alert_type": "BRUTE_FORCE_ATTACK",
            "severity": "HIGH",
            "risk_score": 85
        }

        result = explain_alert(alert)

        self.assertEqual(result["alert_type"], "BRUTE_FORCE_ATTACK")
        self.assertIn("failed login", result["what_happened"])

    def test_malware_alias(self):
        alert = {
            "alert_type": "MALWARE_DETECTED"
        }

        result = explain_alert(alert)

        self.assertIn("malware", result["what_happened"].lower())

    def test_unknown_alert(self):
        alert = {
            "alert_type": "UNKNOWN_ACTIVITY"
        }

        result = explain_alert(alert)

        self.assertEqual(result["alert_type"], "UNKNOWN_ACTIVITY")
        self.assertIn("unusual security event", result["what_happened"])

    def test_missing_optional_fields(self):
        result = explain_alert({})

        self.assertEqual(result["severity"], "MEDIUM")
        self.assertEqual(result["risk_score"], 0)
        self.assertEqual(result["source_ip"], "Unknown")


if __name__ == "__main__":
    unittest.main()
