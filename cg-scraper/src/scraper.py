import requests
import pandas as pd
import os
import logging
import time

# cookie (cc-nx-g_CanadaGooseCA) expires jan 19
cookie = "TLvpzrbXSJUc-4pyLmy6QjjLD_-d7Pgzplsu8lfOpNA"


class Scraper:
    def __init__(self):
        self.base_url = "https://www.canadagoose.com"
        self.access_token = ""

        self.expires_in = 1800

    def run(self):
        self.refresh_tokens()
        df = self.call_api()

        self.save_df(df)

    def call_api(self):
        """ """
        limit = 20
        all_products = []
        catalogue_url = "/mobify/proxy/api/search/shopper-search/v1/organizations/f_ecom_aata_prd/product-search"
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Connection": "keep-alive",
            "x-mobify": "true",
        }
        params = {
            "siteId": "CanadaGooseCA",
            "refine": "cgid=shop-womens",
            "currency": "CAD",
            "locale": "en-CA",
            "expand": "availability,images,prices,represented_products,variations,promotions,custom_properties",
            "allVariationProperties": "true",
            "limit": limit,
        }

        cgids = ["shop-mens", "shop-womens", "shop-kids", "shop-shoes"]

        for cgid in cgids:
            print(f"Scraping {cgid}...")

            params["refine"] = f"cgid={cgid}"
            offset = 0

            while True:
                params["offset"] = offset
                response = self.make_request(catalogue_url, headers, params)

                if not response:
                    break

                data = response.json()

                total_products = data.get("total", 0)
                print(f"Total products in {cgid}: {total_products}")

                if total_products == 0:
                    break

                # Loop through the products in chunks of the limit
                for i in range(0, total_products, limit):
                    offset = i + 1
                    params["offset"] = offset

                    response = self.make_request(catalogue_url, headers, params)
                    if not response:
                        break

                    data = response.json()
                    for hit in data["hits"]:
                        product = hit["representedProduct"]
                        all_products.append(product)

            print(f"Scraping {cgid} complete\n")

        # Return all the products as a DataFrame
        return pd.json_normalize(all_products, sep="_")

    def make_request(
        self, url, headers, params, retries=3, backoff_factor=2, timeout=10
    ):
        """Makes an API request with error handling, retries, and timeout."""
        attempt = 0
        while attempt < retries:
            try:
                # Send the request with a timeout
                response = requests.get(
                    self.base_url + url, headers=headers, params=params, timeout=timeout
                )

                # If the response is successful (status code 200), return it
                if response.status_code == 200:
                    return response

                # Handle specific HTTP status codes
                if response.status_code == 401:
                    logging.warning(
                        "Status Code: 401 - Unauthorized. Token may have expired."
                    )
                    self.refresh_tokens()
                    return None
                elif response.status_code == 404:
                    logging.error(
                        f"Status Code: 404 - Not Found. Endpoint might be incorrect: {url}"
                    )
                    return None
                elif response.status_code == 429:
                    logging.warning(
                        "Status Code: 429 - Too Many Requests. Retrying after a delay."
                    )
                    time.sleep(backoff_factor**attempt)  # Exponential backoff
                elif response.status_code >= 500:
                    logging.error(
                        f"Status Code: {response.status_code} - Server error. Retrying..."
                    )
                    time.sleep(backoff_factor**attempt)  # Exponential backoff
                else:
                    logging.error(
                        f"Status Code: {response.status_code} - Unexpected error."
                    )
                    return None

            except requests.exceptions.RequestException as e:
                logging.error(f"Request failed: {e}. Retrying...")
                time.sleep(backoff_factor**attempt)  # Exponential backoff
            except Exception as e:
                logging.error(f"Unexpected error: {e}")
                return None

            attempt += 1
            logging.info(f"Retrying... Attempt {attempt}/{retries}")

        logging.error("Max retries exceeded. Unable to complete the request.")
        return None

    def save_df(self, df, output_file=os.path.join(os.getcwd(), "data", "output.csv")):
        df.to_csv(output_file, index=False)
        print(f"DataFrame saved to {output_file}")

    def refresh_tokens(self):
        """ """
        auth_url = "/mobify/slas/private/shopper/auth/v1/organizations/f_ecom_aata_prd/oauth2/token"
        payload = {
            "grant_type": "refresh_token",
            "refresh_token": cookie,
            "channel_id": "CanadaGooseCA",
            "dnt": "false",
        }

        response = requests.post(self.base_url + auth_url, data=payload)

        if response.status_code == 200:
            try:
                data = response.json()

                self.access_token = data["access_token"]
                self.expires_in = data["expires_in"]
                print(
                    "Refresh Successful: updating access token expires in",
                    self.expires_in,
                    "\n",
                    self.access_token,
                    "\n",
                )
            except Exception:
                print("Error during json parse", Exception)
        else:
            print("Error with refresh", response.status_code)
