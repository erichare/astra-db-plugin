import os
from astrapy import DataAPIClient
from astrapy.info import (
    AlterTypeRenameFields,
)

# Get a database
client = DataAPIClient()
database = client.get_database(
    os.environ["ASTRA_DB_API_ENDPOINT"], token=os.environ["ASTRA_DB_APPLICATION_TOKEN"]
)

# Rename fields in a user-defined type
database.alter_type(
    "member",
    AlterTypeRenameFields(
        fields={"name": "first_name", "is_active": "is_member"}
    ),
)
