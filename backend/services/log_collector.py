
from datetime import datetime, timezone


def collect_log(source, message, severity="INFO"):
    """
    Create a structured log entry.
    """

    log_entry = {
        "source": source,
        "message": message,
        "severity": severity.upper(),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

    return log_entry
