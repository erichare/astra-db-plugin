import os
from astrapy import DataAPIClient

# Get an existing table
client = DataAPIClient()
database = client.get_database(
    os.environ["ASTRA_DB_API_ENDPOINT"], token=os.environ["ASTRA_DB_APPLICATION_TOKEN"]
)
table = database.get_table("**TABLE_NAME**")

# Find rows
cursor = table.find(
    {"summary": {"$match": "futuristic laboratory discovery"}},
    sort={"summary": "futuristic laboratory"},
)

# Iterate over the found rows
for row in cursor:
    print(row)
