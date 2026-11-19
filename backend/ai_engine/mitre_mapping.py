
# ==========================================
# SENTINELAI - MITRE ATT&CK MAPPING ENGINE
# ==========================================

MITRE_MAPPINGS = {

    "BRUTE_FORCE": {
        "technique_id": "T1110",
        "technique_name": "Brute Force",
        "tactic": "Credential Access",
        "description": "Adversaries attempt to gain access to accounts by systematically guessing credentials."
    },

    "PORT_SCAN": {
        "technique_id": "T1046",
        "technique_name": "Network Service Discovery",
        "tactic": "Discovery",
        "description": "Adversaries scan systems to identify running services and exposed network ports."
    },

    "SUSPICIOUS_LOGIN": {
        "technique_id": "T1078",
        "technique_name": "Valid Accounts",
        "tactic": "Initial Access",
        "description": "Adversaries may use legitimate credentials to gain unauthorized access."
    },

    "REMOTE_ACCESS": {
        "technique_id": "T1021",
        "technique_name": "Remote Services",
        "tactic": "Lateral Movement",
        "description": "Adversaries use remote services to access and move between systems."
    },

    "PHISHING": {
        "technique_id": "T1566",
        "technique_name": "Phishing",
        "tactic": "Initial Access",
        "description": "Adversaries use phishing techniques to trick users into providing information or executing malicious content."
    },

    "MALWARE": {
        "technique_id": "T1204",
        "technique_name": "User Execution",
        "tactic": "Execution",
        "description": "Adversaries rely on a user to execute malicious content."
    }
}


def map_to_mitre(alert_type):

    alert_type = alert_type.upper()

    mapping = MITRE_MAPPINGS.get(alert_type)

    if mapping:

        return {
            "alert_type": alert_type,
            "technique_id": mapping["technique_id"],
            "technique_name": mapping["technique_name"],
            "tactic": mapping["tactic"],
            "description": mapping["description"],
            "mapping_status": "MAPPED"
        }

    return {
        "alert_type": alert_type,
        "technique_id": "UNKNOWN",
        "technique_name": "Unmapped Technique",
        "tactic": "Unknown",
        "description": "No predefined MITRE ATT&CK mapping available.",
        "mapping_status": "UNMAPPED"
    }


# ==========================================
# TESTING
# ==========================================

if __name__ == "__main__":

    test_alerts = [
        "BRUTE_FORCE",
        "PORT_SCAN",
        "SUSPICIOUS_LOGIN",
        "REMOTE_ACCESS",
        "PHISHING",
        "MALWARE",
        "UNKNOWN_ACTIVITY"
    ]

    print("\n========== SENTINELAI MITRE ATT&CK MAPPING ==========")

    for alert_type in test_alerts:

        result = map_to_mitre(alert_type)

        print("\n----------------------------------------")

        for key, value in result.items():
            print(f"{key.replace('_', ' ').title()}: {value}")

    print("\n========== MITRE MAPPING COMPLETED ==========")
