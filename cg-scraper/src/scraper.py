import requests
import pandas as pd

# TODO: refresh cookies via selenium.webdriver
# enter the following in your console
# localStorage.getItem('access_token_CanadaGooseCA')
access_token_CanadaGooseCA = "eyJ2ZXIiOiIxLjAiLCJqa3UiOiJzbGFzL3Byb2QvYWF0YV9wcmQiLCJraWQiOiJiYmY4MWFiNy1kOTg4LTQzYzUtOWQ4YS04ZDc2ZjQxOTAzZjEiLCJ0eXAiOiJqd3QiLCJjbHYiOiJKMi4zLjQiLCJhbGciOiJFUzI1NiJ9.eyJhdXQiOiJHVUlEIiwic2NwIjoic2ZjYy5zaG9wcGVyLW15YWNjb3VudC5iYXNrZXRzIHNmY2Muc2hvcHBlci1kaXNjb3Zlcnktc2VhcmNoIHNmY2Muc2hvcHBlci1teWFjY291bnQucGF5bWVudGluc3RydW1lbnRzIHNmY2Muc2hvcHBlci1jdXN0b21lcnMubG9naW4gc2ZjYy5zaG9wcGVyLWV4cGVyaWVuY2Ugc2ZjYy5zaG9wcGVyLW15YWNjb3VudC5vcmRlcnMgc2ZjYy5zaG9wcGVyLXByb2R1Y3RsaXN0cyBjX3B3YWN1c3RvbXByZWZzX3Igc2ZjYy5zaG9wcGVyLXByb21vdGlvbnMgc2ZjYy5zZXNzaW9uX2JyaWRnZSBzZmNjLnNob3BwZXItbXlhY2NvdW50LnBheW1lbnRpbnN0cnVtZW50cy5ydyBzZmNjLnNob3BwZXItbXlhY2NvdW50LnByb2R1Y3RsaXN0cyBzZmNjLnNob3BwZXItY2F0ZWdvcmllcyBzZmNjLnNob3BwZXItbXlhY2NvdW50IGNfY2dmaW5kc3RvcmVpbnZlbnRvcnlfciBjX0N1c3RvbVByb2R1Y3REYXRhX3Igc2ZjYy5zaG9wcGVyLW15YWNjb3VudC5hZGRyZXNzZXMgc2ZjYy5zaG9wcGVyLXByb2R1Y3RzIHNmY2MudGFfZXh0X29uX2JlaGFsZl9vZiBzZmNjLnNob3BwZXItbXlhY2NvdW50LnJ3IHNmY2Muc2hvcHBlci1zdG9yZXMgc2ZjYy5zaG9wcGVyLWNvbnRleHQucncgc2ZjYy5zaG9wcGVyLWJhc2tldHMtb3JkZXJzIHNmY2Muc2hvcHBlci1jdXN0b21lcnMucmVnaXN0ZXIgc2ZjYy5zaG9wcGVyLW15YWNjb3VudC5hZGRyZXNzZXMucncgc2ZjYy5zaG9wcGVyLW15YWNjb3VudC5wcm9kdWN0bGlzdHMucncgc2ZjYy5zaG9wcGVyLWJhc2tldHMtb3JkZXJzLnJ3IHNmY2Muc2hvcHBlci1naWZ0LWNlcnRpZmljYXRlcyBzZmNjLnNob3BwZXItcHJvZHVjdC1zZWFyY2ggc2ZjYy5zaG9wcGVyLXNlbyBjX2hyZWZ1cmxkYXRhX3IiLCJzdWIiOiJjYy1zbGFzOjphYXRhX3ByZDo6c2NpZDo5NTk4ZTRjNi0wMWViLTRiZmYtYWRmZS05NTUxZjI4Mjg1Yjc6OnVzaWQ6MzAxOGJmMTMtNDRmYS00ODJjLWE0NmItODQxNWEyYTBhODQ2IiwiY3R4Ijoic2xhcyIsImlzcyI6InNsYXMvcHJvZC9hYXRhX3ByZCIsImlzdCI6MSwiZG50IjoiMCIsImF1ZCI6ImNvbW1lcmNlY2xvdWQvcHJvZC9hYXRhX3ByZCIsIm5iZiI6MTczNDY1MzkyNiwic3R5IjoiVXNlciIsImlzYiI6InVpZG86c2xhczo6dXBuOkd1ZXN0Ojp1aWRuOkd1ZXN0IFVzZXI6OmdjaWQ6YmNrWGFWbWVoS2tya1JsYnBLd3FZWW1iaEg6OmNoaWQ6Q2FuYWRhR29vc2VDQSIsImV4cCI6MTczNDY1NTc1NiwiaWF0IjoxNzM0NjUzOTU2LCJqdGkiOiJDMkMtNzk1MDE2NDc2MDExMjM2NTE3MzExMzMyODY1NDQyMDYyOTQzOCJ9.VK0EcJEAoHGp1vuZ8RGX5VUMssia1DvorHZYo4AdCqHx-eeaw_CAql87gXzpLmh7vtEwMPTjeToJYTfC7vT6KA"
url = "https://www.canadagoose.com/mobify/proxy/api/search/shopper-search/v1/organizations/f_ecom_aata_prd/product-search?siteId=CanadaGooseCA&refine=cgid%3Dshop-womens&currency=CAD&locale=en-CA&expand=availability%2Cimages%2Cprices%2Crepresented_products%2Cvariations%2Cpromotions%2Ccustom_properties&allVariationProperties=true&offset=20&limit=20"

headers = {
    'Authorization': f'Bearer {access_token_CanadaGooseCA}',
    'x-mobify': 'true',
}

response = requests.get(url, headers=headers)

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


output_file = '../data/output.csv'
df.to_csv(output_file, index=False)
print(f'DataFrame saved to {output_file}')


class Scraper:
    def __init__(self):
        self.base_url = "https://www.google.com/"

    def run(self):
        response = requests.get(self.base_url)
        if response.status_code == 200:
            print('Success!')