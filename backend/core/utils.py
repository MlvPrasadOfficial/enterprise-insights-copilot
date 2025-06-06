import re
from backend.core.logging import logger

def clean_string_for_storing(string: str) -> str:
    logger.info(f"[utils] clean_string_for_storing called with string: {string}")
    cleaned_string = re.sub(r"\W+", "-", string)
    cleaned_string = re.sub(r"--+", "-", cleaned_string).strip("-")
    logger.info(f"[utils] Cleaned string: {cleaned_string}")
    return cleaned_string
