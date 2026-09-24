import os
from astrapy import DataAPIClient

# Get an admin object
client = DataAPIClient(os.environ["ASTRA_DB_APPLICATION_TOKEN"])
admin = client.get_admin()

# Get a database admin object
database_admin = admin.get_database_admin(api_endpoint=os.environ["ASTRA_DB_API_ENDPOINT"])
