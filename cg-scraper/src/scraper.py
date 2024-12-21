import requests
import pandas as pd
import os

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
        # limit of products that can be returned from api
        limit = 20
        offset = 1
        total_products = float("inf")

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
            "offset": offset,
            "limit": limit,
        }

        cgids = ["shop-mens", "shop-womens", "shop-kids", "shop-shoes"]

        # store all in a list
        all_products = []

        for cgid in cgids:
            print("Scraping", cgid)
            params["refine"] = f"cgid={cgid}"
            offset = 0

            # call API to get the first 20 items, and find the total number of products
            response = requests.get(
                self.base_url + catalogue_url, headers=headers, params=params
            )

            if response.status_code == 401:
                print(f"Status Code: {response.status_code}")
                print("refresh the access token!")
                exit()
            elif response.status_code != 200:
                print("oh no something went wrong!", response.status_code)

            data = response.json()

            try:
                # TODO: depending on the total, make multiple calls to the API
                total_products = data["total"]
                print(f"Total products: {total_products}")

                # loop through all the objects:
                for i in range(
                    total_products // limit
                    + (1 if total_products % limit else 0)
                ):
                    # modify the offset each time to get the next 20 items
                    offset = i * limit + 1
                    params["offset"] = offset
                    print("current offset", offset)

                    response = requests.get(
                        self.base_url + catalogue_url,
                        headers=headers,
                        params=params,
                    )

                    if response.status_code == 401:
                        print(f"Status Code: {response.status_code}")
                        print("refresh the access token!")
                        exit()
                    elif response.status_code != 200:
                        print("oh no something went wrong!")

                    data = response.json()

                    for hit in data["hits"]:
                        product = hit["representedProduct"]
                        # print(f'parsing product {product['c_fsProductName']}')

                        # TODO: parse any fields that might need special attention
                        # c_customBulletPoints
                        # c_cloudinaryImageObjectCache
                        # c_variationAttributes

                        all_products.append(product)
            except Exception:
                print("oh no!", Exception)
            finally:
                print(f"Scraping {cgid} complete\n")

        # save all products to pandas df
        df = pd.json_normalize(all_products, sep="_")
        print(df)
        return df

    def save_df(
        self, df, output_file=os.path.join(os.getcwd(), "data", "output.csv")
    ):
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
