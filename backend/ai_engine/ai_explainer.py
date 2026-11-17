
# ==========================================
# SENTINELAI - AI ALERT EXPLANATION ENGINE
# ==========================================

def explain_alert(alert):

    alert_type = str(
        alert.get("alert_type", "UNKNOWN")
    ).strip().upper()

    # Normalize alert type names from threat detection
    alert_type_aliases = {
        "BRUTE_FORCE_ATTACK": "BRUTE_FORCE",
        "MALWARE_DETECTED": "MALWARE"
    }

    lookup_type = alert_type_aliases.get(
        alert_type, alert_type
    )

    severity = alert.get("severity", "MEDIUM")
    risk_score = alert.get("risk_score", 0)
    source_ip = alert.get("source_ip", "Unknown")
    description = alert.get(
        "description", "No description available"
    )

    explanations = {
        "BRUTE_FORCE": {
            "meaning": "Multiple failed login attempts detected.",
            "impact": "An attacker may be attempting to guess valid credentials.",
            "recommendation": "Check authentication logs, verify the source IP, and investigate the targeted account."
        },

        "PORT_SCAN": {
            "meaning": "Multiple network ports were accessed or probed.",
            "impact": "An attacker may be discovering exposed services.",
            "recommendation": "Review network traffic, identify the scanning host, and check exposed services."
        },

        "SUSPICIOUS_LOGIN": {
            "meaning": "A potentially suspicious login activity was detected.",
            "impact": "An unauthorized user may have gained access to an account.",
            "recommendation": "Verify the login location, timestamp, account owner, and authentication history."
        },

        "MALWARE": {
            "meaning": "Potential malware activity was detected.",
            "impact": "Malicious software may compromise system confidentiality and integrity.",
            "recommendation": "Investigate the affected endpoint, inspect indicators of compromise, and follow incident response procedures."
        }
    }

    details = explanations.get(lookup_type, {
        "meaning": "An unusual security event was detected.",
        "impact": "The activity may indicate a potential security threat.",
        "recommendation": "Review the associated logs and investigate the event."
    })

    explanation = {
        "alert_type": alert_type,
        "severity": severity,
        "risk_score": risk_score,
        "source_ip": source_ip,
        "description": description,
        "what_happened": details["meaning"],
        "potential_impact": details["impact"],
        "recommended_action": details["recommendation"]
    }

    return explanation


# ==========================================
# TESTING
# ==========================================

if __name__ == "__main__":

    sample_alert = {
        "alert_type": "BRUTE_FORCE_ATTACK",
        "severity": "HIGH",
        "risk_score": 85,
        "source_ip": "192.168.1.100",
        "description": "Multiple failed SSH login attempts detected."
    }

    result = explain_alert(sample_alert)

    print("\n========== SENTINELAI ALERT EXPLANATION ==========")

    for key, value in result.items():
        print(f"{key.replace('_', ' ').title()}: {value}")

    print("\n========== EXPLANATION COMPLETED ==========")
