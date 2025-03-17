import tempfile
import os
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
        (pd.Series({"cimulateTags": "jacket, down, men"}), ""),
        (pd.Series({"colorName": "Black", "cimulateTags": None}), "black"),
        (
            pd.Series(
                {
                    "colorName": "Navy",
                    "fabricTechnology": "Nylon-Tech-Shell",
                    "fsProductDescriptionShort": "A navy jacket",
                    "cimulateTags": "a tag",
                }
            ),
            "navy, a navy jacket",
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


@pytest.mark.parametrize(
    "variation_attributes, expected_colors",
    [
        # Test valid color data
        (
            """{'name': 'Colour', 'id': 'Color', 'values': [ 
            {'id': '66', 'description': 'Graphite'}, 
            {'id': '63', 'description': 'Atlantic Navy'}]} {'name': 'Size', 'id': 'Size', 'swatchable': False, 'values': [{}]}"}""",
            {"66": "Graphite", "63": "Atlantic Navy"},
        ),
        # Test empty values
        (
            """{'name': 'Colour', 'id': 'Color', 'values': []} {'name': 'Size', 'id': 'Size', 'swatchable': False, 'values': [{}]}"}""",
            {},
        ),
        # Test missing color info
        (
            """{'name': 'Size', 'id': 'Size', 'swatchable': False, 'values': [{}]}"}""",
            {},
        ),
        # Test invalid JSON
        ("invalid", {}),
        # Test None input
        (None, {}),
    ],
)
def test_extract_color_info(variation_attributes, expected_colors):
    """Test color extraction from variation attributes"""
    sanitizer = Sanitizer()
    result = sanitizer.extract_color_info(variation_attributes)
    assert result == expected_colors, f"Expected {expected_colors}, but got {result}"


def test_separate_colors(tmp_path):
    """Test color separation logic"""
    # Create a temporary file for testing
    output_json = tmp_path / "test_output.json"

    # Initialize sanitizer with test output path
    sanitizer = Sanitizer()
    sanitizer.output_json = str(output_json)

    # Create a sample row with variation attributes and image URLs
    row = pd.Series(
        {
            "id": "test123",
            "variationAttributes": """{'name': 'Colour', 'id': 'Color', 'values': [
            {'id': '61', 'description': 'Black'},
            {'id': '222', 'description': 'Blue'}
            ]} {'name': 'Size', 'id': 'Size', 'swatchable': False, 'values': [{}]}""",
            "otherProductImageUrl": "image_61_a.jpg image_61_b.jpg image_222_a.jpg",
            "cimulateTags": "jacket, winter",
            "fabricTechnology": "tech",
            "gender": "male",
        }
    )

    print(sanitizer.extract_color_info(row["variationAttributes"]))
    # Get color variations
    variations = sanitizer.separate_colors(row)

    # Verify results
    assert len(variations) == 2

    # Check first color variation (Black)
    black_variant = next(v for v in variations if v["colorName"] == "Black")
    assert black_variant["id"] == "test123_61"
    assert "image_61_a.jpg" in black_variant["otherProductImageUrl"]
    assert "image_61_b.jpg" in black_variant["otherProductImageUrl"]
    assert "image_222" not in black_variant["otherProductImageUrl"]

    # Check second color variation (Blue)
    blue_variant = next(v for v in variations if v["colorName"] == "Blue")
    assert blue_variant["id"] == "test123_222"
    assert "image_222_a.jpg" in blue_variant["otherProductImageUrl"]
    assert "image_61" not in blue_variant["otherProductImageUrl"]
