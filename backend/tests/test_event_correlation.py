
import unittest

from backend.ai_engine.event_correlation import correlate_events


class TestEventCorrelation(unittest.TestCase):

    def test_empty_events(self):
        result = correlate_events([])

        self.assertEqual(result["total_events_analyzed"], 0)
        self.assertEqual(result["total_correlated_alerts"], 0)

    def test_source_ip_correlation(self):
        events = [
            {
                "timestamp": f"2026-11-17T10:0{index}:00Z",
                "event_type": event_type,
                "source_ip": "192.168.1.100",
                "username": "admin",
                "status": "detected"
            }
            for index, event_type in enumerate([
                "login",
                "port_scan",
                "unauthorized_access"
            ])
        ]

        result = correlate_events(events)

        self.assertGreaterEqual(result["total_correlated_alerts"], 1)
        self.assertTrue(any(
            alert["alert_type"] == "SOURCE_IP_EVENT_CORRELATION"
            for alert in result["alerts"]
        ))

    def test_distributed_login_attack(self):
        events = []

        for index in range(5):
            events.append({
                "timestamp": f"2026-11-17T10:0{index}:00Z",
                "event_type": "login",
                "source_ip": f"192.168.1.{100 + index}",
                "username": "administrator",
                "status": "failed"
            })

        result = correlate_events(events)

        self.assertTrue(any(
            alert["alert_type"] == "DISTRIBUTED_LOGIN_ATTACK"
            for alert in result["alerts"]
        ))

        distributed_alert = next(
            alert for alert in result["alerts"]
            if alert["alert_type"] == "DISTRIBUTED_LOGIN_ATTACK"
        )

        self.assertEqual(distributed_alert["severity"], "CRITICAL")
        self.assertEqual(distributed_alert["correlated_event_count"], 5)

    def test_single_event_no_correlation(self):
        events = [{
            "timestamp": "2026-11-17T10:00:00Z",
            "event_type": "login",
            "source_ip": "192.168.1.100",
            "username": "admin",
            "status": "failed"
        }]

        result = correlate_events(events)

        self.assertEqual(result["total_correlated_alerts"], 0)

    def test_invalid_timestamp(self):
        events = [{
            "event_type": "login",
            "source_ip": "192.168.1.100",
            "username": "admin",
            "status": "failed"
        }]

        result = correlate_events(events)

        self.assertEqual(result["total_events_analyzed"], 0)
        self.assertEqual(len(result["invalid_events"]), 1)

    def test_correlation_event_evidence(self):
        events = [
            {
                "timestamp": f"2026-11-17T10:0{index}:00Z",
                "event_type": event_type,
                "source_ip": "10.0.0.10",
                "username": "admin",
                "status": "detected"
            }
            for index, event_type in enumerate([
                "login",
                "port_scan",
                "malware_detected"
            ])
        ]

        result = correlate_events(events)

        alert = next(
            alert for alert in result["alerts"]
            if alert["alert_type"] == "SOURCE_IP_EVENT_CORRELATION"
        )

        self.assertEqual(alert["correlated_event_count"], 3)
        self.assertEqual(alert["source_ips"], ["10.0.0.10"])
        self.assertEqual(len(alert["evidence"]), 3)
        self.assertEqual(alert["status"], "NEW")


if __name__ == "__main__":
    unittest.main()
