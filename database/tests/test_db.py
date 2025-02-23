from pinecone.grpc import PineconeGRPC, GRPCClientConfig
from pinecone import ServerlessSpec
import time
from src.db import DatabaseHelper

# init Pinecone local instance
pc = PineconeGRPC(api_key="pclocal", host="http://localhost:5080")

index_name = "test-index"
namespace = "test-namespace"

if not DatabaseHelper.check_has_index(pc, index_name):
    print(f"Index {index_name} does not exist. Creating index...")
    pc.create_index(
        name=index_name,
        dimension=2,
        metric="cosine",
        spec=ServerlessSpec(
            cloud="aws",
            region="us-east-1",
        ),
    )

# Wait for the index to be ready
while not pc.describe_index(index_name).status["ready"]:
    time.sleep(1)

# Target the index, disabling tls
index_model = pc.describe_index(index_name)
index_host = index_model.host
grpc_config = GRPCClientConfig(secure=False)
index = pc.Index(host=index_host, grpc_config=grpc_config)

# create config
config = {
    "pc": pc,
    "openai_key": None,
    "index_name": index_name,
    "index": index,
    "data_path": None,
    "batch_size": 100,
}

# create database helper
database_helper = DatabaseHelper(config)
database_helper.init_index(index)


def test_upsert():
    # upsert data
    vectors = [
        {"id": "vec1", "values": [1.0, -2.5], "metadata": {"genre": "drama"}},
        {"id": "vec2", "values": [3.0, -2.0], "metadata": {"genre": "documentary"}},
        {"id": "vec3", "values": [0.5, -1.5], "metadata": {"genre": "documentary"}},
    ]
    result = database_helper.upsert_index(vectors, namespace)
    assert result is None
