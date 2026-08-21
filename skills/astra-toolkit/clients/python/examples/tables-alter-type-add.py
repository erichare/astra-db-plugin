from astrapy import DataAPIClient
from astrapy.info import (
    AlterTypeAddFields,
    ColumnType,
    TableScalarColumnTypeDescriptor,
)

# Get a database
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)

# Add fields to a user-defined type
database.alter_type(
    "member",
    AlterTypeAddFields(
        fields={
            "email": TableScalarColumnTypeDescriptor(ColumnType.TEXT),
            "credits": TableScalarColumnTypeDescriptor(ColumnType.INT),
        }
    ),
)
