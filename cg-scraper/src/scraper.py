import requests
import pandas as pd

# cookie (cc-nx-g_CanadaGooseCA) expires jan 19
cookie = "TLvpzrbXSJUc-4pyLmy6QjjLD_-d7Pgzplsu8lfOpNA"

class Scraper:
    def __init__(self):
        self.base_url = "https://www.canadagoose.com"
        self.access_token = ''

        self.expires_in = 1800
        self.current_iteration = 0

    def run(self):
        self.refresh_tokens()
        df = self.call_api()

        self.save_df(df)

    def call_api(self):
        '''
        '''
        catalogue_url = "/mobify/proxy/api/search/shopper-search/v1/organizations/f_ecom_aata_prd/product-search?siteId=CanadaGooseCA&refine=cgid%3Dshop-womens&currency=CAD&locale=en-CA&expand=availability%2Cimages%2Cprices%2Crepresented_products%2Cvariations%2Cpromotions%2Ccustom_properties&allVariationProperties=true&offset=20&limit=20"
        headers = {
            'Authorization': f'Bearer {self.access_token}',
            'Connection': 'keep-alive',
            'x-mobify': 'true',
        }

        response = requests.get(self.base_url + catalogue_url, headers=headers)

        if response.status_code == 401:
            print(f'Status Code: {response.status_code}')
            print('refresh the access token!')
            exit()
        elif response.status_code != 200:
            print('oh no something went wrong!')

        data = response.json()

        # store all in a list
        all_products = []

        try:
            # TODO: depending on the total, make multiple calls to the API
            total_products = data['total']
            print(f'Total products: {total_products}')

            for hit in data['hits']:
                product = hit['representedProduct']
                print(f'parsing product {product['c_fsProductName']}')

                # TODO: parse any fields that might need special attention

                all_products.append(product)
        except:
            print('oh no!')

        # save all products to pandas df
        df = pd.json_normalize(all_products, sep="_")
        print(df)
        return df

    def save_df(self, df, output_file='../data/output.csv'):
        df.to_csv(output_file, index=False)
        print(f'DataFrame saved to {output_file}')

    
    def refresh_tokens(self):
        '''
        '''
        auth_url = "/mobify/slas/private/shopper/auth/v1/organizations/f_ecom_aata_prd/oauth2/token"
        payload = {
            'grant_type': 'refresh_token',
            'refresh_token': cookie,
            'channel_id': 'CanadaGooseCA',
            'dnt': 'false'
        }

        response = requests.post(self.base_url + auth_url, data=payload)

        if (response.status_code == 200):
            try:
                data = response.json()
                
                self.access_token = data['access_token']
                self.expires_in = data['expires_in']
                print('Refresh Successful: updating access token expires in', self.expires_in, '\n', self.access_token, '\n')
            except:
                print('Error during json parse')
        else:
            print('Error with refresh', response.status_code)    

