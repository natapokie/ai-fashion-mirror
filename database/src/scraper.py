import requests
import pandas as pd
import os
import logging
import time
import json

# cookie (cc-nx-g_CanadaGooseCA) expires jan 19
cookie = "TLvpzrbXSJUc-4pyLmy6QjjLD_-d7Pgzplsu8lfOpNA"


class Scraper:
    def __init__(self, limit=0, remove_categories=None):
        self.base_url = "https://www.canadagoose.com"
        self.image_url = "https://images.canadagoose.com/image/upload"
        self.access_token = ""
        self.expires_in = 1800
        self.limit = limit  # Limit per category
        self.remove_categories = remove_categories if remove_categories else []

    def run(self):
        self.refresh_tokens()
        df = self.call_api()
        self.save_df(df)

    def call_api(self):
        """Fetch products from the API and handle paging."""
        batch_size = 20  # Default batch size
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
            "offset": 1,
            "limit": batch_size,
        }

        cgids = ["shop-mens", "shop-womens", "shop-kids", "shop-shoes"]

        # Remove excluded categories
        cgids = [
            c
            for c in cgids
            if c.lower() not in {cat.lower() for cat in self.remove_categories}
        ]

        for cgid in cgids:
            print(f"Scraping {cgid}")
            params["refine"] = f"cgid={cgid}"
            offset = 0  # Reset offset for each category
            category_products = []  # Track products for this category

            # Initial API call to get total number of products
            response = self.make_request(catalogue_url, headers, params)
            if not response:
                print(f"Failed to fetch products for category {cgid}. Skipping.")
                continue  # Skip if the request fails

            data = response.json()

            try:
                total_products = data.get("total", 0)
                print(f"Total products: {total_products}")

                # Calculate products to fetch for this category
                products_to_fetch = min(total_products, self.limit) if self.limit > 0 else total_products

                # Loop through all pages based on total products
                for i in range(
                    total_products // batch_size + (1 if total_products % batch_size else 0)
                ):
                    offset = i * batch_size + 1  # Calculate the offset for each page
                    params["offset"] = offset
                    print(f"Fetching products with offset {offset}")

                    response = self.make_request(catalogue_url, headers, params)
                    if not response:
                        print(f"Failed to fetch data for offset {offset}. Skipping.")
                        continue  # Skip if the request fails

                    data = response.json()

                    # Extract and store product data
                    for hit in data.get("hits", []):
                        product = hit.get("representedProduct", {})

                        model_image, other_images = self.parse_image_cache(
                            product.get("c_cloudinaryImageObjectCache")
                        )
                        product["modelImageUrl"] = model_image
                        product["otherProductImageUrl"] = other_images

                        category_products.append(product)

                        # Check category limit
                        if self.limit and len(category_products) >= self.limit:
                            print(f"Category limit of {self.limit} reached for {cgid}")
                            break

                    # If we've reached the limit for this category, stop fetching more pages
                    if self.limit and len(category_products) >= self.limit:
                        break

                # Add this category's products to the main list
                all_products.extend(category_products)
                print(f"Added {len(category_products)} products from {cgid}")

            except Exception as e:
                print(f"Error while processing category {cgid}: {e}")
            finally:
                print(f"Scraping {cgid} complete")

        # Convert to DataFrame
        df = pd.json_normalize(all_products, sep="_")
        print(df)
        return df

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

    def save_df(self, df, output_file=None):
        if output_file is None:
            output_file = os.path.join(os.getcwd(), "data", "output.csv")

        df.to_csv(output_file, index=False)
        print(f"DataFrame saved to {output_file}")

    def parse_image_cache(self, json_obj):
        """
        Parses the c_cloudinaryImageObjectCache and returns a tuple containing
        (main image with model, list of all the other images) images are urls

        e.g. of image url,
        https://images.canadagoose.com/image/upload/product-image/1272MCD_9061.jpg
        """

        main_image = ""
        other_images = []

        cache = json.loads(json_obj)

        for _, value in cache.items():
            public_id = value.get("public_id")
            format = value.get("format")

            product_image_url = f"{self.image_url}/{public_id}.{format}"

            if public_id.count("_") > 1:
                # this is not the main model image
                other_images.append(product_image_url)
            else:
                main_image = product_image_url

        return (main_image, other_images)

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