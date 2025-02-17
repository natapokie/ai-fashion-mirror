import pytest
import pandas as pd
from src.sanitizer import Sanitizer

sanitizer = Sanitizer()


def test_run():
    """
    Test that the data is cleaned and saved correctly.
    """
    pass


@pytest.mark.parametrize(
    "row, expected_result",
    [
        (pd.Series({"cimulateTags": "jacket, down, men"}), "jacket, down, men"),
        (pd.Series({"colorName": "Black", "cimulateTags": None}), "black"),
        (
            pd.Series(
                {
                    "colorName": "Navy",
                    "fabricTechnology": "Nylon-Tech-Shell",
                    "cimulateTags": None,
                }
            ),
            "navy, nylon-tech-shell",
        ),
    ],
)
def test_generate_embedding_tags(row, expected_result):
    """
    Test that the embedding tags are generated correctly.
    """
    assert sanitizer.generate_embedding_tags(row) == expected_result


@pytest.mark.parametrize(
    "value, expected_result",
    [
        ("['Nylon-Tech-Shell']", "Nylon-Tech-Shell"),
        (
            "['lightweight-down-jackets', 'hybridge-knits']",
            "lightweight-down-jackets hybridge-knits",
        ),
        ("relaxed", "relaxed"),
        # TODO: check this test case -- is this the expected result?
        (
            "[{'name': 'Colour', 'id': 'Color', 'swatchable': True, 'values': []}]",
            "{'name': 'Colour', 'id': 'Color', 'swatchable': True, 'values': []}",
        ),
    ],
)
def test_clean_array_string(value, expected_result):
    """
    Test that array strings are cleaned correctly.
    """
    assert sanitizer.clean_array_string(value) == expected_result
