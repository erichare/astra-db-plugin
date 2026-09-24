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
    {"number_of_pages": {"$lt": 300}},
    projection={"is_checked_out": False, "title": False},
)

print(result)
