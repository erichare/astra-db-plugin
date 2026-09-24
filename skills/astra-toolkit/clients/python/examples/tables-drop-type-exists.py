import os
from astrapy import DataAPIClient

# Get a database
client = DataAPIClient()
database = client.get_database(
    os.environ["ASTRA_DB_API_ENDPOINT"], token=os.environ["ASTRA_DB_APPLICATION_TOKEN"]
)

# Drop a user-defined type
database.drop_type("**UDT_NAME**", if_exists=True)
