import os
import time
import json
import openai
from pinecone import Pinecone, Index, ServerlessSpec
from dotenv import load_dotenv


class DatabaseHelper:
    def __init__(self, config=None, index_name=None):
        # load .env file
        current_dir = os.path.dirname(os.path.abspath(__file__))
        env_path = os.path.join(current_dir, "..", "..", ".env")
        load_dotenv(env_path)

        # Get the Pinecone host environment variable
        pinecone_host = os.getenv("PINECONE_HOST")

        # Configure Pinecone client
        pinecone_config = {"api_key": os.getenv("PINECONE_API_KEY")}

        # Add host if available (for local testing)
        if pinecone_host:
            pinecone_config["host"] = pinecone_host

        # set up configuration
        self.config = config or {
            "pc": Pinecone(**pinecone_config),
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
        self.index_name = index_name or self.config["index_name"]
        self.index: Index | None = self.config["index"]

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
        return find_index

    def describe_index(self):
        if self.index is None:
            self.init_index()

        # Initialize items (only if we need to work with data)
        self.data = None
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

    def load_data(self):
        """Load data from the cleaned output file"""
        try:
            with open("data/cleaned_output.json", "r", encoding="utf-8") as file:
                self.data = json.load(file)
            print(f"Loaded {len(self.data)} items from data/cleaned_output.json")
        except FileNotFoundError:
            print("Warning: data/cleaned_output.json not found")
            self.data = []

    def describe_index(self):
        """Get statistics about the current index"""
        if self.index is not None:
            return self.index.describe_index_stats()
        else:
            print(f"Index '{self.index_name}' is not available")
            return None

    def create_index(self, dimension=1536, max_wait_time=15):
        """Create a new Pinecone index with the given dimension."""
        if self.pc.has_index(self.index_name):
            print(f"Index '{self.index_name}' already exists.")
            return False

        # Check if using local Pinecone by checking host
        is_local = (
            "host" in self.config["pc"].__dict__
            and "localhost" in self.config["pc"].__dict__["host"]
        )

        # Skip ServerlessSpec for local instance
        if is_local:
            self.pc.create_index(
                name=self.index_name, dimension=dimension, metric="cosine"
            )
        else:
            # Cloud Pinecone needs the ServerlessSpec
            self.pc.create_index(
                name=self.index_name,
                dimension=dimension,
                metric="cosine",
                spec=ServerlessSpec(cloud="aws", region="us-east-1"),
            )

        print(f"Creating index '{self.index_name}'...")

        # Start time tracking for timeout
        start_time = time.time()

        while time.time() - start_time < max_wait_time:
            try:
                status = self.pc.describe_index(self.index_name).status
                if status.get("ready", False):
                    print(f"Index '{self.index_name}' is ready.")
                    self.index = self.pc.Index(
                        self.index_name
                    )  # Initialize the index object
                    return True
                print("Waiting for index to be ready...")
            except Exception as e:
                print(f"Error checking index status: {e}")

            time.sleep(5)

        # If we exit the loop, the index is not ready within max_wait_time
        print(
            f"Error: Index '{self.index_name}' was not ready after {max_wait_time} seconds. Please try again later."
        )
        return False

    def delete_all_vectors(self):
        """Delete all vectors from the index"""
        if not self.check_valid_index():
            return False

        try:
            self.index.delete(delete_all=True, namespace="ns1")
            print(
                f"All vectors deleted from index '{self.index_name}', namespace 'ns1'"
            )
            return True
        except Exception as e:
            print(f"Error deleting vectors: {e}")
            return False

    def delete_index(self):
        """Delete the entire Pinecone index"""
        if not self.check_valid_index():
            return False

        try:
            self.pc.delete_index(self.index_name)
            print(f"Index '{self.index_name}' deleted")

            # Set index to None since it no longer exists
            self.index = None
            return True
        except Exception as e:
            print(f"Error deleting index: {e}")
            return False

    # Embed data
    def embed(self, docs: list[str]) -> list[list[float]]:
        res = openai.embeddings.create(input=docs, model="text-embedding-ada-002")
        doc_embeds = [r.embedding for r in res.data]
        return doc_embeds

    # Upsert handler
    def upsert_handler(self):
        if self.data is None:
            self.load_data()

        if not self.data:
            print("No data to upsert")
            return

        if not self.check_valid_index():
            return

        data = self.data
        # Split data into batches
        for i in range(0, len(data), self.batch_size):
            batch = data[i : i + self.batch_size]
            vectors = self.batch_to_vectors(batch)
            self.upsert_to_index(vectors)
            print(
                f"Upserted batch {i//self.batch_size + 1}/{-(-len(data)//self.batch_size)} ({len(batch)} items)"
            )
        print(f"Upserted total of {len(data)} items")

    # converts data to vectors
    def batch_to_vectors(self, data: list[dict], namespace="ns1") -> list[dict]:
        doc_embeds = self.embed([d.get("embeddingTags", "") for d in data])

        vectors = []
        for d, e in zip(data, doc_embeds):
            metadata = {k: str(d.get(k, "")) for k in metadata_fields}
            vectors.append(
                {
                    "id": str(d["id"]),
                    "values": e,  # Embedding vector
                    "metadata": metadata,
                }
            )

        return vectors

    # Upsert vectors to the index
    def upsert_to_index(self, vectors: list[dict], namespace: str = "ns1"):
        self.index.upsert(vectors=vectors, namespace=namespace)

    # Query the index
    def query_index(self, query: str):
        if not self.check_valid_index():
            return None

        x = self.embed([query])

        if self.index is None:
            self.init_index()

        results = self.index.query(
            namespace="ns1",
            vector=x[0],
            top_k=3,
            include_values=False,
            include_metadata=True,
        )
        return results

    def check_valid_index(self):
        """Helper function to check if the index exists"""
        if not self.pc.has_index(self.index_name):
            print(f"Index '{self.index_name}' does not exist")
            return False

        return True

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
