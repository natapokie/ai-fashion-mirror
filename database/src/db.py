import os
import json
import openai
from pinecone import Pinecone
from dotenv import load_dotenv


class DatabaseHelper:
    def __init__(self):
        # load .env file
        current_dir = os.path.dirname(os.path.abspath(__file__))
        env_path = os.path.join(current_dir, "..", "..", ".env")
        load_dotenv(env_path)

        # Configure APIs
        pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
        openai.api_key = os.getenv("OPENAI_API_KEY")

        # Setup index
        index_name = os.getenv("PINECONE_INDEX_NAME")
        if not pc.has_index(index_name):
            print("Index not found")
        self.index = pc.Index(os.getenv("PINECONE_INDEX_NAME"))
        self.describe_index()

        # Initialize items
        with open("data/cleaned_output.json", "r", encoding="utf-8") as file:
            self.data = json.load(file)
        self.batch_size = 100

    def describe_index(self):
        return self.index.describe_index_stats()

    # Embed data
    def embed(self, docs: list[str]) -> list[list[float]]:
        res = openai.embeddings.create(input=docs, model="text-embedding-ada-002")
        doc_embeds = [r.embedding for r in res.data]
        return doc_embeds

    # Upsert handler
    def upsert_handler(self, data: list[dict]):
        # Split data into batches
        for i in range(0, len(data), self.batch_size):
            batch = data[i : i + self.batch_size]
            self.upsert_index(batch)
            print(
                f"Upserted batch {i//self.batch_size + 1}/{-(-len(data)//self.batch_size)} ({len(batch)} items)"
            )

    # Upsert data to the index
    def upsert_index(self, data: list[dict]):
        doc_embeds = self.embed([d.get("embeddingTags", "") for d in self.data])

        vectors = []
        for d, e in zip(data, doc_embeds):
            vectors.append(
                {
                    "id": str(d["id"]),
                    "values": e,  # Embedding vector
                    "metadata": {
                        "embeddingTags": str(
                            d.get("embeddingTags", "")
                        ),  # Store embeddingTags
                        "colorName": str(d.get("colorName", "")),
                        "fabricTechnology": str(d.get("fabricTechnology", "")),
                        "fsProductDescriptionShort": str(
                            d.get("fsProductDescriptionShort", "")
                        ),
                        "fsProductName": str(d.get("fsProductName", "")),
                        "gender": str(d.get("gender", "")),
                        "lengthDescription": str(d.get("lengthDescription", "")),
                        "modelImageUrl": str(d.get("modelImageUrl", "")),
                        "otherProductImageUrl": str(d.get("otherProductImageUrl", "")),
                    },
                }
            )

        self.index.upsert(vectors=vectors, namespace="ns1")

    # Query the index
    def query_index(self, query: str):
        x = self.embed([query])

        results = self.index.query(
            namespace="ns1",
            vector=x[0],
            top_k=3,
            include_values=False,
            include_metadata=True,
        )
        return results

    # Debugging purposes only
    def test(self):
        db = DatabaseHelper()
        print(db.describe_index())
        db.upsert_handler(db.data)
        print(db.query_index("Wyndham Parka"))
