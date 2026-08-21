import hashlib

from astrapy import DataAPIClient
from astrapy.exceptions.data_api_exceptions import (
    DataAPIResponseException,
)

# Get an existing collection
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
collection = database.get_collection("**COLLECTION_NAME**")

# Example document
document = {
    "title": "Example article",
    "content": "This is the main text of the document. _id is generated from this field so that this field is never duplicated across documents.",
    "source": "https://example.com",
}

# Derive a deterministic _id based on the "content" field
document["_id"] = hashlib.sha256(
    document["content"].encode("utf-8")
).hexdigest()

try:
    result = collection.insert_one(document)
    print("Inserted new document with _id:", result.inserted_id)
except DataAPIResponseException as exception:
    # Check for DOCUMENT_ALREADY_EXISTS from the Data API error code
    is_duplicate = any(
        descriptor.error_code == "DOCUMENT_ALREADY_EXISTS"
        for descriptor in exception.error_descriptors
    )

    if is_duplicate:
        print("Document already exists with this _id; skipping insert.")
    else:
        # Re-raise for any other Data API error
        raise
