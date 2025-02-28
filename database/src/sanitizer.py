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

    def clean_json_string(self, json_str):
        # Clean and format JSON string for parsing
        if pd.isna(json_str):
            return "[]"

        try:
            if isinstance(json_str, str):
                # Remove any leading/trailing whitespace
                cleaned = json_str.strip()

                # Replace single quotes with double quotes
                cleaned = cleaned.replace("'", '"')

                # Replace boolean values
                cleaned = cleaned.replace("True", "true").replace("False", "false")

                # Handle multiple JSON objects separated by space
                if "} {" in cleaned:
                    parts = cleaned.split("} {")
                    # Take only the first object (color attributes)
                    cleaned = parts[0] + "}"

                # Handle array-like strings
                if cleaned.startswith("[{") and cleaned.endswith("}]"):
                    # Already in correct format
                    pass
                elif cleaned.startswith("{") and cleaned.endswith("}"):
                    # Single object, wrap in array
                    cleaned = f"[{cleaned}]"
                else:
                    # Invalid format, return empty array
                    return "[]"

                # Validate JSON structure
                json.loads(cleaned)  # This will raise JSONDecodeError if invalid
                return cleaned
            else:
                # If input is not a string, convert it to JSON string
                return json.dumps(
                    [json_str] if not isinstance(json_str, list) else json_str
                )
        except json.JSONDecodeError as e:
            print(f"Error cleaning JSON string: {e}")
            print(f"Original string: {json_str}")
            return "[]"

    def separate_colors(self, row):
        try:
            # Parse variation attributes to get color options
            variation_data = json.loads(
                self.clean_json_string(row["variationAttributes"])
            )
            if not variation_data:
                return []

            color_data = next(
                (item for item in variation_data if item["id"] == "Color"), None
            )
            if not color_data or "values" not in color_data:
                return []

            products = []
            if color_data and "values" in color_data:
                # Split all image URLs once
                all_urls = (
                    row.get("otherProductImageUrl", "").split(" ")
                    if row.get("otherProductImageUrl")
                    else []
                )

                for color in color_data["values"]:
                    # Filter URLs for this specific color
                    color_urls = [url for url in all_urls if f"_{color['id']}_" in url]
                    color_urls_str = " ".join(color_urls) if color_urls else None

                    # Create a new product for each color
                    fields = {
                        "id": f"{row['id']}_{color['id']}",
                        "cimulateTags": row.get("cimulateTags"),
                        "colorName": color["description"],
                        "fabricTechnology": row.get("fabricTechnology"),
                        "fill": row.get("fill"),
                        "fit": row.get("fit"),
                        "fsProductDescriptionShort": row.get(
                            "fsProductDescriptionShort"
                        ),
                        "fsProductName": row.get("fsProductName"),
                        "gender": row.get("gender"),
                        "lengthDescription": row.get("lengthDescription"),
                        "modelImageUrl": row.get("modelImageUrl"),
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
