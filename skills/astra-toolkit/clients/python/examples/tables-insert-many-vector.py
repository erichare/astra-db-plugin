from astrapy import DataAPIClient
from astrapy.data_types import (
    DataAPIVector,
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
            "summary_genres_vector": DataAPIVector([0.08, -0.62, 0.39]),
        },
        {
            "title": "Desert Peace",
            "author": "Walter Dray",
            "summary_genres_vector": DataAPIVector([0.12, 0.53, 0.32]),
        },
    ]
)
