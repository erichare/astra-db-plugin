import os
from astrapy import DataAPIClient

# Get an admin object
client = DataAPIClient(os.environ["ASTRA_DB_APPLICATION_TOKEN"])
admin = client.get_admin()
