import os
from astrapy import DataAPIClient

# Get a database object
client = DataAPIClient()
database = client.get_database(
    os.environ["ASTRA_DB_API_ENDPOINT"], token=os.environ["ASTRA_DB_APPLICATION_TOKEN"]
)

# Get a database admin object
database_admin = database.get_database_admin()
