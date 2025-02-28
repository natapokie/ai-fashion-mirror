import os
import time
import json
import openai
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv


class DatabaseHelper:
    def __init__(self, index_name=None):
        # load .env file
        current_dir = os.path.dirname(os.path.abspath(__file__))
        env_path = os.path.join(current_dir, "..", "..", ".env")
        load_dotenv(env_path)

        # Configure APIs
        self.pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
        openai.api_key = os.getenv("OPENAI_API_KEY")

        # Setup index - use provided index name or get from env
        self.index_name = index_name or os.getenv("PINECONE_INDEX_NAME")
        
        # Initialize self.index explicitly
        self.index = None
        
        if self.pc.has_index(self.index_name):
            self.index = self.pc.Index(self.index_name)
            self.describe_index()
        else:
            print(f"Index '{self.index_name}' not found")

        # Initialize items (only if we need to work with data)
        self.data = None
        self.batch_size = 100
    
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

    def create_index(self, dimension=1536):
        """Create a new Pinecone index with the given dimension"""
        if self.pc.has_index(self.index_name):
            print(f"Index '{self.index_name}' already exists")
            return False
        
        self.pc.create_index(
            name=self.index_name,
            dimension=dimension,  # Default 1536 for OpenAI Ada-002
            metric="cosine",
            spec=ServerlessSpec(
                cloud="aws",
                region="us-east-1"
            )
        )
        
        print(f"Creating index '{self.index_name}'...")
        
        # Wait for index to be ready
        max_wait_time = 60  # seconds
        start_time = time.time()
        
        while time.time() - start_time < max_wait_time:
            try:
                if self.pc.describe_index(self.index_name).status["ready"]:
                    break
                print("Waiting for index to be ready...")
                time.sleep(5)
            except Exception:
                # Index might not be immediately available in describe call
                time.sleep(5)
        
        print(f"Index '{self.index_name}' is ready")
        
        # Initialize the index object
        self.index = self.pc.Index(self.index_name)
        return True

    def delete_all_vectors(self):
        """Delete all vectors from the index"""
        if not self.check_valid_index():
            return False
            
        try:
            self.index.delete(delete_all=True, namespace="ns1")
            print(f"All vectors deleted from index '{self.index_name}', namespace 'ns1'")
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
            self.upsert_index(batch)
            print(
                f"Upserted batch {i//self.batch_size + 1}/{-(-len(data)//self.batch_size)} ({len(batch)} items)"
            )
        print(f"Upserted total of {len(data)} items")

    # Upsert data to the index
    def upsert_index(self, data: list[dict]):
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

        self.index.upsert(vectors=vectors, namespace="ns1")

    # Query the index
    def query_index(self, query: str):
        if not self.check_valid_index():
            return None
            
        x = self.embed([query])

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
