
import unittest

from backend.ai_engine.threat_detection import detect_threats


class TestThreatDetection(unittest.TestCase):

    def test_normal_login_no_alert(self):
        events = [{
            "timestamp": "2026-11-17T10:00:00Z",
            "event_type": "login",
            "source_ip": "192.168.1.10",
            "username": "user01",
            "status": "success"
        }]

        result = detect_threats(events)

        self.assertEqual(result["total_alerts"], 0)

    def test_brute_force_detection(self):
        events = []

        for attempt in range(5):
            events.append({
                "timestamp": f"2026-11-17T10:0{attempt}:00Z",
                "event_type": "login",
                "source_ip": "192.168.1.100",
                "username": "admin",
                "status": "failed"
            })

        result = detect_threats(events)

        self.assertEqual(result["total_alerts"], 1)
        self.assertEqual(
            result["alerts"][0]["alert_type"],
            "BRUTE_FORCE_ATTACK"
        )
        self.assertEqual(result["alerts"][0]["severity"], "HIGH")

    def test_port_scan_detection(self):
        events = [{
            "timestamp": "2026-11-17T10:00:00Z",
            "event_type": "port_scan",
            "source_ip": "192.168.1.105",
            "username": "unknown",
            "status": "detected"
        }]

        result = detect_threats(events)

        self.assertEqual(result["total_alerts"], 1)
        self.assertEqual(result["alerts"][0]["alert_type"], "PORT_SCAN")

    def test_malware_detection(self):
        events = [{
            "timestamp": "2026-11-17T10:00:00Z",
            "event_type": "malware_detected",
            "source_ip": "192.168.1.110",
            "username": "user01",
            "status": "detected"
        }]

        result = detect_threats(events)

        self.assertEqual(result["total_alerts"], 1)
        self.assertEqual(result["alerts"][0]["severity"], "CRITICAL")

    def test_invalid_timestamp_handling(self):
        events = [{
            "event_type": "login",
            "source_ip": "192.168.1.10",
            "username": "user01",
            "status": "failed"
        }]

        result = detect_threats(events)

        self.assertEqual(result["total_events_analyzed"], 0)
        self.assertEqual(len(result["invalid_events"]), 1)

    def test_empty_events(self):
        result = detect_threats([])

        self.assertEqual(result["total_events_received"], 0)
        self.assertEqual(result["total_alerts"], 0)


if __name__ == "__main__":
    unittest.main()
