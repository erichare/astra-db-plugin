import os
from astrapy import DataAPIClient

client = DataAPIClient(os.environ["ASTRA_DB_APPLICATION_TOKEN"])

admin = client.get_admin()

admin.create_database(
    "**DATABASE_NAME**", cloud_provider="gcp", region="us-east1"
)
