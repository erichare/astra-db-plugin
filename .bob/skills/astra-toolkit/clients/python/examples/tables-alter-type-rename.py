from astrapy import DataAPIClient
from astrapy.info import (
    AlterTypeRenameFields,
)

# Get a database
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)

# Rename fields in a user-defined type
database.alter_type(
    "member",
    AlterTypeRenameFields(
        fields={"name": "first_name", "is_active": "is_member"}
    ),
)
