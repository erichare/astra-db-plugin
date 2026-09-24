import os
from astrapy import DataAPIClient

# Get a database
client = DataAPIClient()
database = client.get_database(
    os.environ["ASTRA_DB_API_ENDPOINT"], token=os.environ["ASTRA_DB_APPLICATION_TOKEN"]
)

# Drop an index
database.drop_table_index("**INDEX_NAME**")
