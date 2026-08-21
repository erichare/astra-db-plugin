from astrapy import DataAPIClient
from astrapy.info import (
    AlterTableAddColumns,
    TableVectorColumnTypeDescriptor,
)

# Get an existing table
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
table = database.get_table("**TABLE_NAME**")

# Add a vector column
table.alter(
    AlterTableAddColumns(
        columns={
            "example_vector": TableVectorColumnTypeDescriptor(
                dimension=1024,
            ),
        },
    )
)
