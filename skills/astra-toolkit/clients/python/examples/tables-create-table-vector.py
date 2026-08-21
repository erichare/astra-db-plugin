from astrapy import DataAPIClient

# Get an existing database
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)

# Define the columns and primary key for the table
table_definition = {
    "columns": {
        "example_vector": {"type": "vector", "dimension": 1024},
        "example_non_vector": {"type": "text"},
    },
    "primaryKey": {
        "partitionBy": ["example_non_vector"],
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
    TablePrimaryKeyDescriptor,
    TableScalarColumnTypeDescriptor,
    TableVectorColumnTypeDescriptor,
)

# Get an existing database
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)

table_definition = CreateTableDefinition(
    # Define all of the columns in the table
    columns={
        "example_vector": TableVectorColumnTypeDescriptor(
            dimension=1024,
        ),
        "example_non_vector": TableScalarColumnTypeDescriptor(
            column_type=ColumnType.TEXT
        ),
    },
    # Define the primary key for the table.
    # In this case, the table uses a single-column primary key.
    primary_key=TablePrimaryKeyDescriptor(
        partition_by=["example_non_vector"], partition_sort={}
    ),
)

table = database.create_table(
    "example_table",
    definition=table_definition,
)

# ==============  BOUNDARY BETWEEN EXAMPLE SNIPPETS  ==============

from astrapy import DataAPIClient
from astrapy.info import ColumnType, CreateTableDefinition

# Get an existing database
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)

table_definition = (
    CreateTableDefinition.builder()
    # Define all of the columns in the table
    .add_vector_column("example_vector", dimension=1024)
    .add_column("example_non_vector", ColumnType.TEXT)
    # Define the primary key for the table.
    # In this case, the table uses a single-column primary key.
    .add_partition_by(["example_non_vector"])
    # Finally, build the table definition.
    .build()
)

table = database.create_table(
    "example_table",
    definition=table_definition,
)
