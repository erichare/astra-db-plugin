from astrapy import DataAPIClient
from astrapy.info import (
    ColumnType,
    CreateTypeDefinition,
    TableScalarColumnTypeDescriptor,
)

# Get a database
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)

# Create a user-defined type
type_definition = CreateTypeDefinition(
    fields={
        "name": TableScalarColumnTypeDescriptor(ColumnType.TEXT),
        "is_active": TableScalarColumnTypeDescriptor(ColumnType.BOOLEAN),
        "date_joined": TableScalarColumnTypeDescriptor(ColumnType.DATE),
    },
)
database.create_type(
    "member", definition=type_definition, if_not_exists=True
)
