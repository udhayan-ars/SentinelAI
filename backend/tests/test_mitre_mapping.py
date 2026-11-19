
import unittest

from backend.ai_engine.mitre_mapping import map_to_mitre


class TestMitreMapping(unittest.TestCase):

    def test_brute_force_mapping(self):
        result = map_to_mitre("BRUTE_FORCE")

        self.assertEqual(result["technique_id"], "T1110")
        self.assertEqual(result["tactic"], "Credential Access")
        self.assertEqual(result["mapping_status"], "MAPPED")

    def test_port_scan_mapping(self):
        result = map_to_mitre("PORT_SCAN")

        self.assertEqual(result["technique_id"], "T1046")
        self.assertEqual(result["technique_name"], "Network Service Discovery")

    def test_phishing_mapping(self):
        result = map_to_mitre("PHISHING")

        self.assertEqual(result["technique_id"], "T1566")
        self.assertEqual(result["mapping_status"], "MAPPED")

    def test_case_insensitive_mapping(self):
        result = map_to_mitre("brute_force")

        self.assertEqual(result["technique_id"], "T1110")

    def test_unknown_alert(self):
        result = map_to_mitre("UNKNOWN_ACTIVITY")

        self.assertEqual(result["technique_id"], "UNKNOWN")
        self.assertEqual(result["mapping_status"], "UNMAPPED")


if __name__ == "__main__":
    unittest.main()
