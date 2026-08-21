from astrapy import DataAPIClient
from astrapy.info import (
    ColumnType,
    CreateTableDefinition,
    TableKeyValuedColumnType,
    TableKeyValuedColumnTypeDescriptor,
    TablePrimaryKeyDescriptor,
    TableScalarColumnTypeDescriptor,
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
        "title": TableScalarColumnTypeDescriptor(
            column_type=ColumnType.TEXT
        ),
        "number_of_pages": TableScalarColumnTypeDescriptor(
            column_type=ColumnType.INT
        ),
        "rating": TableScalarColumnTypeDescriptor(
            column_type=ColumnType.FLOAT
        ),
        "genres": TableValuedColumnTypeDescriptor(
            column_type=TableValuedColumnType.SET,
            value_type=ColumnType.TEXT,
        ),
        "metadata": TableKeyValuedColumnTypeDescriptor(
            column_type=TableKeyValuedColumnType.MAP,
            key_type=ColumnType.TEXT,
            value_type=ColumnType.TEXT,
        ),
        "is_checked_out": TableScalarColumnTypeDescriptor(
            column_type=ColumnType.BOOLEAN
        ),
        "due_date": TableScalarColumnTypeDescriptor(
            column_type=ColumnType.DATE
        ),
    },
    # Define the primary key for the table.
    # In this case, the table uses a single-column primary key.
    primary_key=TablePrimaryKeyDescriptor(
        partition_by=["title"], partition_sort={}
    ),
)

table = database.create_table(
    "example_table",
    definition=table_definition,
    keyspace="**KEYSPACE_NAME**",
)
