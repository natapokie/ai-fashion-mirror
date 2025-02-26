import os
import json
import openai
from pinecone import Pinecone, Index
from dotenv import load_dotenv


class DatabaseHelper:
    def __init__(self, config=None):
        # load .env file
        current_dir = os.path.dirname(os.path.abspath(__file__))
        env_path = os.path.join(current_dir, "..", "..", ".env")
        load_dotenv(env_path)

        # set up configuration
        self.config = config or {
            "pc": Pinecone(api_key=os.getenv("PINECONE_API_KEY")),
            "openai_key": os.getenv("OPENAI_API_KEY"),
            "index_name": os.getenv("PINECONE_INDEX_NAME"),
            "index": None,
            "data_path": "data/cleaned_output.json",
            "batch_size": 100,
        }

        # Configure APIs
        self.pc: Pinecone = self.config["pc"]
        openai.api_key = self.config["openai_key"]

        # Setup index
        self.index_name: str = self.config["index_name"]
        self.index: Index | None = None

        # if not self.check_has_index(self.pc, self.index_name):
        #     # if the index is not found, make sure to throw error
        #     raise ValueError(f"Index {self.index_name} not found")

        # self.index: Index = self.pc.Index(self.index_name)
        # self.describe_index()

        # Initialize items
        # with open(self.config["data_path"], "r", encoding="utf-8") as file:
        #     self.data = json.load(file)
        self.batch_size = self.config["batch_size"]

    def init_index(self, index: Index = None) -> Index:
        """
        Initialize the index. If the index is not found, raise an error.
        """
        if index:
            self.index = index
            return index

        if not self.check_has_index(self.pc, self.index_name):
            raise ValueError(f"Index {self.index_name} not found")

        find_index = self.pc.Index(self.index_name)
        self.index = find_index
        return find_index

    def describe_index(self):
        if self.index is None:
            self.init_index()
        return self.index.describe_index_stats()

    # Embed data
    def embed(self, docs: list[str]) -> list[list[float]]:
        res = openai.embeddings.create(input=docs, model="text-embedding-ada-002")
        doc_embeds = [r.embedding for r in res.data]
        return doc_embeds

    # Upsert handler
    def upsert_handler(self):
        """
        Handles adding data to the database.
        Steps:
        1. Load JSON data from the configured path.
        2. Set up the index.
        3. Split data into smaller chunks.
        4. Prepare each chunk for adding to the database.
        5. Print progress updates.
        """
        # load json data
        self.data = self.load_json_data(self.config["data_path"])

        # Initialize index
        self.init_index()

        # Split data into batches
        for i in range(0, len(self.data), self.batch_size):
            batch = self.data[i : i + self.batch_size]
            vector = self.batch_to_vectors(batch)
            self.upsert_to_index(vector)
            print(
                f"Upserted batch {i//self.batch_size + 1}/{-(-len(self.data)//self.batch_size)} ({len(batch)} items)"
            )
        print(f"Upserted total of {len(self.data)} items")

    # converts data to vectors
    def batch_to_vectors(self, data: list[dict]) -> list[dict]:
        doc_embeds = self.embed([d.get("embeddingTags", "") for d in data])

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

        return vectors

    # Upsert vectors to the index
    def upsert_to_index(self, vectors: list[dict], namespace: str = "ns1"):
        self.index.upsert(vectors=vectors, namespace=namespace)

    # Query the index
    def query_index(self, query: str, namespace: str = "ns1"):
        x = self.embed([query])

        if self.index is None:
            self.init_index()

        results = self.index.query(
            namespace=namespace,
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
        db.upsert_handler()
        print(db.query_index("Wyndham Parka"))

    @staticmethod
    def load_json_data(path: str) -> list[dict]:
        with open(path, "r", encoding="utf-8") as file:
            return json.load(file)

    @staticmethod
    def check_has_index(pc: Pinecone, index_name: str) -> bool:
        indexes = pc.list_indexes()
        return any(index.name == index_name for index in indexes)
