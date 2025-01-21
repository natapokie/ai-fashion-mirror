import os
from dotenv import load_dotenv
from pinecone import Pinecone

# load .env file
current_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(current_dir, "..", "..", ".env")
load_dotenv(env_path)

# create pinecone obj
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
pc_index = pc.Index(host=os.getenv("PINECONE_INDEX_HOST"))


class DatabaseHelper:

    @staticmethod
    def check_index():
        # return the stats of the index
        # you can use as a sanity check to make sure you're connected
        return pc_index.describe_index_stats()

    # TODO: add other static methods needed to upsert, fetch indexes, etc.
