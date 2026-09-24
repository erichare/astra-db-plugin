import os
from astrapy import DataAPIClient
from astrapy.data_types import (
    DataAPIVector,
)

# Get an existing table
client = DataAPIClient()
database = client.get_database(
    os.environ["ASTRA_DB_API_ENDPOINT"], token=os.environ["ASTRA_DB_APPLICATION_TOKEN"]
)
table = database.get_table("**TABLE_NAME**")

# Insert a row into the table
result = table.insert_one(
    {
        "title": "Computed Wilderness",
        "author": "Ryan Eau",
        "summary_genres_vector": DataAPIVector([0.08, -0.62, 0.39]),
    }
)
