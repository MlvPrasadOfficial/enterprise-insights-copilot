import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

"""
Unit tests for backend core utility functions.
"""
from backend.core.utils import clean_string_for_storing


def test_clean_string_for_storing_basic():
    assert clean_string_for_storing("Hello World!") == "Hello-World"
    assert clean_string_for_storing("A  B  C") == "A-B-C"
    assert clean_string_for_storing("file@name#2025.csv") == "file-name-2025-csv"
    assert clean_string_for_storing("---foo---bar---") == "foo-bar"
