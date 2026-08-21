from astrapy import DataAPIClient

# Get an existing database
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)

# Define the columns and primary key for the table
table_definition = {
    "columns": {
        "id": {"type": "uuid"},
        "group_leader": {
            "type": "userDefined",
            "udtName": "person",
        },
        "group_members": {
            "type": "set",
            "valueType": {
                "type": "userDefined",
                "udtName": "person",
            },
        },
        "group_roles": {
            "type": "map",
            "keyType": "text",
            "valueType": {
                "type": "userDefined",
                "udtName": "person",
            },
        },
    },
    "primaryKey": {
        "partitionBy": ["id"],
        "partitionSort": {},
    },
}

table = database.create_table(
    "example_table",
    definition=table_definition,
)

# ==============  BOUNDARY BETWEEN EXAMPLE SNIPPETS  ==============

from astrapy import DataAPIClient
from astrapy.info import (
    ColumnType,
    CreateTableDefinition,
    TableKeyValuedColumnType,
    TableKeyValuedColumnTypeDescriptor,
    TablePrimaryKeyDescriptor,
    TableScalarColumnTypeDescriptor,
    TableUDTColumnDescriptor,
    TableValuedColumnType,
    TableValuedColumnTypeDescriptor,
)

# Get an existing database
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)

table_definition = CreateTableDefinition(
    # Define all of the columns in the table
    columns={
        "id": TableScalarColumnTypeDescriptor(
            column_type=ColumnType.UUID
        ),
        "group_leader": TableUDTColumnDescriptor(udt_name="person"),
        "group_members": TableValuedColumnTypeDescriptor(
            column_type=TableValuedColumnType.SET,
            value_type=TableUDTColumnDescriptor(
                udt_name="person",
            ),
        ),
        "group_roles": TableKeyValuedColumnTypeDescriptor(
            column_type=TableKeyValuedColumnType.MAP,
            key_type=ColumnType.TEXT,
            value_type=TableUDTColumnDescriptor(
                udt_name="person",
            ),
        ),
    },
    primary_key=TablePrimaryKeyDescriptor(
        partition_by=["id"], partition_sort={}
    ),
)

table = database.create_table(
    "example_table",
    definition=table_definition,
)

# ==============  BOUNDARY BETWEEN EXAMPLE SNIPPETS  ==============

from astrapy import DataAPIClient
from astrapy.info import (
    ColumnType,
    CreateTableDefinition,
    TableUDTColumnDescriptor,
)

# Get an existing database
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)

table_definition = (
    CreateTableDefinition.builder()
    # Define all of the columns in the table
    .add_scalar_column("id", ColumnType.UUID)
    .add_userdefinedtype_column("group_leader", udt_name="person")
    .add_set_column(
        "group_members",
        value_type=TableUDTColumnDescriptor(
            udt_name="person",
        ),
    )
    .add_map_column(
        "group_roles",
        key_type=ColumnType.TEXT,
        value_type=TableUDTColumnDescriptor(
            udt_name="person",
        ),
    )
    # Define the primary key for the table.
    .add_partition_by(["id"])
    # Finally, build the table definition.
    .build()
)

table = database.create_table(
    "example_table",
    definition=table_definition,
)
