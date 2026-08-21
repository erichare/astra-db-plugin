from astrapy import DataAPIClient

# Get an existing database
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)

# Define the columns and primary key for the table
table_definition = {
    "columns": {
        "title": {"type": "text"},
        "number_of_pages": {"type": "int"},
        "rating": {"type": "float"},
        "genres": {"type": "set", "valueType": "text"},
        "metadata": {
            "type": "map",
            "keyType": "text",
            "valueType": "text",
        },
        "is_checked_out": {"type": "boolean"},
        "due_date": {"type": "date"},
    },
    "primaryKey": {
        "partitionBy": ["title", "rating"],
        "partitionSort": {"number_of_pages": 1, "is_checked_out": -1},
    },
}

table = database.create_table(
    "example_table",
    definition=table_definition,
)

# ==============  BOUNDARY BETWEEN EXAMPLE SNIPPETS  ==============

from astrapy import DataAPIClient
from astrapy.constants import SortMode
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
    # In this case, the table uses a compound primary key.
    primary_key=TablePrimaryKeyDescriptor(
        partition_by=["title", "rating"],
        partition_sort={
            "number_of_pages": SortMode.ASCENDING,
            "is_checked_out": SortMode.DESCENDING,
        },
    ),
)

table = database.create_table(
    "example_table",
    definition=table_definition,
)

# ==============  BOUNDARY BETWEEN EXAMPLE SNIPPETS  ==============

from astrapy import DataAPIClient
from astrapy.constants import SortMode
from astrapy.info import ColumnType, CreateTableDefinition

# Get an existing database
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)

table_definition = (
    CreateTableDefinition.builder()
    # Define all of the columns in the table
    .add_column("title", ColumnType.TEXT)
    .add_column("number_of_pages", ColumnType.INT)
    .add_column("rating", ColumnType.FLOAT)
    .add_set_column(
        "genres",
        ColumnType.TEXT,
    )
    .add_map_column(
        "metadata",
        # This is the key type for the map column
        ColumnType.TEXT,
        # This is the value type for the map column
        ColumnType.TEXT,
    )
    .add_column("is_checked_out", ColumnType.BOOLEAN)
    .add_column("due_date", ColumnType.DATE)
    # Define the primary key for the table.
    # In this case, the table uses a compound primary key.
    .add_partition_by(["title", "rating"])
    .add_partition_sort(
        {
            "number_of_pages": SortMode.ASCENDING,
            "is_checked_out": SortMode.DESCENDING,
        }
    )
    # Finally, build the table definition.
    .build()
)

table = database.create_table(
    "example_table",
    definition=table_definition,
)
