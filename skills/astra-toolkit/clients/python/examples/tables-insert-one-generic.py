import os
from astrapy import DataAPIClient
from astrapy.data_types import (
    DataAPIDate,
    DataAPISet,
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
        "number_of_pages": 432,
        "due_date": DataAPIDate.from_string("2024-12-18"),
        "genres": DataAPISet(["History", "Biography"]),
    }
)
