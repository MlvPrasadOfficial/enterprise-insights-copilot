"""
Utility functions for string cleaning and (future) dataframe/chart utilities.
"""

import re
from backend.core.logging import logger


def clean_string_for_storing(string: str) -> str:
    """
    Clean a string for safe storing by replacing non-word characters with dashes and collapsing multiple dashes.
    Args:
        string (str): The input string to clean.
    Returns:
        str: The cleaned string, safe for storing as a filename or key.
    """
    logger.info(f"[utils] clean_string_for_storing called with string: {string}")
    cleaned_string = re.sub(r"\W+", "-", string)
    cleaned_string = re.sub(r"--+", "-", cleaned_string).strip("-")
    logger.info(f"[utils] Cleaned string: {cleaned_string}")
    return cleaned_string


def map_categorical_values(record: dict) -> dict:
    """
    Map known categorical codes to human-friendly values in a record dict.
    Currently supports 'Gender' (m/f -> Male/Female).
    Args:
        record (dict): The record to map.
    Returns:
        dict: The mapped record.
    """
    gender_map = {'m': 'Male', 'f': 'Female', 'M': 'Male', 'F': 'Female'}
    if 'Gender' in record:
        val = str(record['Gender']).strip().lower()
        record['Gender'] = gender_map.get(val, record['Gender'])
    return record


# --- DataFrame and chart utilities for modularization ---
# def profile_dataframe(df: pd.DataFrame) -> dict:
#     """
#     Profile a DataFrame: columns, shape, dtypes, missing values, summary stats.
#     Args:
#         df (pd.DataFrame): The DataFrame to profile.
#     Returns:
#         dict: Profiling information.
#     """
#     ...
#
# def build_chart(...):
#     ...
