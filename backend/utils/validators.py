
def validate_log_data(data):
    """Validate incoming log data."""

    if not isinstance(data, dict):
        return "Invalid JSON data"

    required_fields = ["source", "level", "message"]

    for field in required_fields:
        value = data.get(field)

        if not isinstance(value, str) or not value.strip():
            return f"Missing or invalid field: {field}"

    return None
