import re

def clean_string_for_storing(string: str) -> str:
    cleaned_string = re.sub(r"\W+", "-", string)
    cleaned_string = re.sub(r"--+", "-", cleaned_string).strip("-")
    return cleaned_string
