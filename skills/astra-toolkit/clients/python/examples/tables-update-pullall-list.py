import os
from astrapy import DataAPIClient

# Get an existing table
client = DataAPIClient()
database = client.get_database(
    os.environ["ASTRA_DB_API_ENDPOINT"], token=os.environ["ASTRA_DB_APPLICATION_TOKEN"]
)
table = database.get_table("**TABLE_NAME**")

# Update a row
table.update_one(
    {"title": "Hidden Shadows of the Past", "author": "John Anthony"},
    {
        "$pullAll": {
            "genres": ["SciFi", "Romance"],
        }
    },
)
