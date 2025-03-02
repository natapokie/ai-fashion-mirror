import pandas as pd
import ast
import json
import re


class Sanitizer:
    def __init__(self):
        # Define file paths
        self.input_file = "data/output.csv"
        self.output_file = "data/cleaned_output.csv"
        self.output_json = "data/cleaned_output.json"

        # List of columns to keep
        self.columns_to_keep = [
            "id",
            "c_cimulateTags",
            "c_colorName",
            "c_fabricTechnology",
            "c_fill",
            "c_fit",
            "c_fsProductDescriptionShort",
            "c_fsProductName",
            "c_gender",
            "c_lengthDescription",
            "modelImageUrl",
            "c_variationAttributes",
            "otherProductImageUrl",
        ]

        self.exclude_from_embedding = {
            "id",
            "modelImageUrl",
            "c_variationAttributions",
            "otherProductImageUrl",
        }

    def run(self):
        print("Cleaning data")

        try:
            # Read CSV file
            df = pd.read_csv(self.input_file)

            # Keep only the specified columns
            df = df[self.columns_to_keep]

            # Rename columns by removing leading "c_"
            df.rename(
                columns=lambda col: col[2:] if col.startswith("c_") else col,
                inplace=True,
            )

            # Clean array strings
            df = df.map(self.clean_array_string)

            # Generate embedding_tags column
            df["embeddingTags"] = df.apply(self.generate_embedding_tags, axis=1)

            # Create a list to store all products with their color variations
            all_products = []

            # Process each row and create separate entries for each color
            for _, row in df.iterrows():
                color_variations = self.separate_colors(row)
                all_products.extend(color_variations)

            # Save the cleaned CSV
            df.to_csv(self.output_file, index=False)
            print(f"Cleaned data saved to {self.output_file}. {len(df)} entries saved.")

            # Save as json
            # df.to_json(self.output_json, orient="records", indent=4)
            with open(self.output_json, "w") as f:
                json.dump(all_products, f, indent=4)
            print(f"Saved as json to {self.output_json}")

        except FileNotFoundError:
            print(f"Error: File {self.input_file} not found.")
        except KeyError as e:
            print(f"Error: Missing expected columns {e}")
        except Exception as e:
            print(f"Unexpected error: {e}")

    def clean_array_string(self, value):
        if isinstance(value, str) and value.startswith("[") and value.endswith("]"):
            try:
                # Convert string to list
                parsed_list = ast.literal_eval(value)
                if isinstance(parsed_list, list):
                    return " ".join(map(str, parsed_list))

            except (ValueError, SyntaxError):
                pass
        return value

    def generate_embedding_tags(self, row):
        # Use cimulateTags if it's not NaN or empty
        if pd.notna(row["cimulateTags"]) and row["cimulateTags"].strip():
            return row["cimulateTags"]

        # Otherwise, create one from other fields
        text_fields = [
            str(row[col]).strip()
            for col in row.index
            if col not in self.exclude_from_embedding and pd.notna(row[col])
        ]

        return ", ".join(text_fields).lower()

    def extract_colors(self, text):
        # Split the text into individual dictionaries (handling concatenated JSON-like structures)
        parts = text.split("} {")

        # Add back the missing closing bracket
        color_info = parts[0] + "}"

        colors = {}

        try:
            # Parse the string into a Python dict
            data = ast.literal_eval(color_info)

            # Target the "Colour" section
            if data.get("name") == "Colour":
                for color_info in data.get("values", []):
                    color_id = color_info.get("id")
                    description = color_info.get("description")
                    if color_id and description:
                        colors[color_id] = description
        except (SyntaxError, ValueError) as e:
            print(f"Error parsing data: {e}")

        return colors

    def separate_colors(self, row):
        try:
            color_data = self.extract_colors(row["variationAttributes"])
            products = []
            if color_data:
                # Split all image URLs once
                all_urls = (
                    row.get("otherProductImageUrl", "").split(" ")
                    if row.get("otherProductImageUrl")
                    else []
                )

                for color_id, color_name in color_data.items():
                    # Filter URLs for this specific color
                    color_urls = [url for url in all_urls if f"_{color_id}_" in url]
                    model_urls = [url for url in all_urls if f"_{color_id}_fsph" in url]
                    color_urls_str = " ".join(color_urls) if color_urls else None
                    model_urls_str = " ".join(model_urls) if model_urls else None

                    # Create a new product for each color
                    fields = {
                        "id": f"{row['id']}_{color_id}",
                        "cimulateTags": row.get("cimulateTags"),
                        "colorName": color_name,
                        "fabricTechnology": row.get("fabricTechnology"),
                        "fill": row.get("fill"),
                        "fit": row.get("fit"),
                        "fsProductDescriptionShort": row.get(
                            "fsProductDescriptionShort"
                        ),
                        "fsProductName": row.get("fsProductName"),
                        "gender": row.get("gender"),
                        "lengthDescription": row.get("lengthDescription"),
                        "modelImageUrl": model_urls_str,
                        "variationAttributes": row.get("variationAttributes"),
                        "otherProductImageUrl": color_urls_str,
                        "embeddingTags": row.get("embeddingTags"),
                    }

                    # Replace NaN with None
                    new_product = {
                        key: None if pd.isna(value) else value
                        for key, value in fields.items()
                    }

                    products.append(new_product)

                return products

        except Exception as e:
            print(f"Error in separate_colors: {e}")
            return []  # Always return empty list for invalid inputs
