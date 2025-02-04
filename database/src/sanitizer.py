import pandas as pd
import ast


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
            "otherProductImageUrl",
        ]

        self.exclude_from_embedding = {"id", "modelImageUrl", "otherProductImageUrl"}

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

            # Save the cleaned CSV
            df.to_csv(self.output_file, index=False)
            print(f"Cleaned data saved to {self.output_file}. {len(df)} entries saved.")

            # Save as json
            df.to_json(self.output_json, orient="records", indent=4)
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
