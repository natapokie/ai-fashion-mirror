import unittest
from src.scraper import Scraper


class TestScraper(unittest.TestCase):

    def setUp(self):
        self.scaper = Scraper()

    def test_make_request(self):
        # test code here
        self.assertTrue(True)


if __name__ == "__main__":
    unittest.main()
