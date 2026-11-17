
def parse_log(log_entry):
    """
    Validate and normalize a log entry.
    """

    if not isinstance(log_entry, dict):
        raise ValueError("Log entry must be a dictionary")

    required_fields = ["source", "message", "severity", "timestamp"]

    for field in required_fields:
        if field not in log_entry:
            raise ValueError(f"Missing required field: {field}")

    parsed_log = {
        "source": str(log_entry["source"]).strip(),
        "message": str(log_entry["message"]).strip(),
        "severity": str(log_entry["severity"]).upper().strip(),
        "timestamp": log_entry["timestamp"]
    }

    if not parsed_log["source"] or not parsed_log["message"]:
        raise ValueError("Source and message cannot be empty")

    return parsed_log
