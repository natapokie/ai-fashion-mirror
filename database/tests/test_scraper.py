import pytest
import json
from src.scraper import Scraper

scraper = Scraper()


@pytest.fixture
def init_image_cache():
    """
    Create a cache for images.
    """
    cache = {
        "1272MCD_9061_s": {
            "public_id": "product-image/1272MCD_9061_s",
            "filename": "1272MCD_9061_s",
            "format": "jpg",
            "folder": "product-image",
            "version": 1733240735,
            "resource_type": "image",
            "type": "upload",
        },
        "1272MCD_9061": {
            "public_id": "product-image/1272MCD_9061",
            "filename": "1272MCD_9061",
            "format": "jpg",
            "folder": "product-image",
            "version": 1733240732,
            "resource_type": "image",
            "type": "upload",
        },
    }
    return json.dumps(cache)


def test_refresh_token():
    """
    Test that the access token is refreshed/updated.
    """
    scraper.refresh_tokens()
    assert scraper.access_token is not None
    assert scraper.expires_in is not None


def test_parse_image_cache(init_image_cache):
    """
    Test that the image cache is parsed correctly.
    """
    main_image, other_images = scraper.parse_image_cache(init_image_cache)
    assert main_image.endswith("1272MCD_9061.jpg")
    assert len(other_images) == 1
    assert any(item.endswith("1272MCD_9061_s.jpg") for item in other_images)
