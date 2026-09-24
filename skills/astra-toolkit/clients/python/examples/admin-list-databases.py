import os
from astrapy import DataAPIClient

client = DataAPIClient(os.environ["ASTRA_DB_APPLICATION_TOKEN"])

admin = client.get_admin()

databases = admin.list_databases()

print(databases)
