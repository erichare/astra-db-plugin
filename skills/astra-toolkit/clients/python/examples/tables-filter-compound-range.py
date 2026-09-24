import os
from astrapy import DataAPIClient

# Get an existing table
client = DataAPIClient()
database = client.get_database(
    os.environ["ASTRA_DB_API_ENDPOINT"], token=os.environ["ASTRA_DB_APPLICATION_TOKEN"]
)
table = database.get_table("**TABLE_NAME**")

# Find a row
result = table.find_one(
    {
        "$and": [
            {"number_of_pages": {"$lt": 300}},
            {"number_of_pages": {"$gte": 200}},
        ]
    }
)

print(result)
