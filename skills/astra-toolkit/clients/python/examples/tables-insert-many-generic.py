from astrapy import DataAPIClient
from astrapy.data_types import (
    DataAPIDate,
    DataAPISet,
)

# Get an existing table
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
table = database.get_table("**TABLE_NAME**")

# Insert rows into the table
result = table.insert_many(
    [
        {
            "title": "Computed Wilderness",
            "author": "Ryan Eau",
            "number_of_pages": 432,
            "due_date": DataAPIDate.from_string("2024-12-18"),
            "genres": DataAPISet(["History", "Biography"]),
        },
        {
            "title": "Desert Peace",
            "author": "Walter Dray",
            "number_of_pages": 355,
            "rating": 4.5,
        },
    ]
)
