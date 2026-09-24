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
    {}, sort={"summary_genres_vector": "Text to vectorize"}
)

# Iterate over the found rows
for row in cursor:
    print(row)
