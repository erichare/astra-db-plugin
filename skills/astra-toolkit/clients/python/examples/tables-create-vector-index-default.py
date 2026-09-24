import os
from astrapy import DataAPIClient

# Get an existing table
client = DataAPIClient()
database = client.get_database(
    os.environ["ASTRA_DB_API_ENDPOINT"], token=os.environ["ASTRA_DB_APPLICATION_TOKEN"]
)
table = database.get_table("**TABLE_NAME**")

# Index a vector column
table.create_vector_index(
    "**INDEX_NAME**", column="**VECTOR_COLUMN_NAME**"
)
