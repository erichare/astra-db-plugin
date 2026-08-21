from astrapy import DataAPIClient
from astrapy.info import (
    AlterTableAddColumns,
    ColumnType,
    TableScalarColumnTypeDescriptor,
)

# Get an existing table
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
table = database.get_table("**TABLE_NAME**")

# Add columns
table.alter(
    AlterTableAddColumns(
        columns={
            "is_summer_reading": TableScalarColumnTypeDescriptor(
                column_type=ColumnType.BOOLEAN,
            ),
            "library_branch": TableScalarColumnTypeDescriptor(
                column_type=ColumnType.TEXT,
            ),
        },
    ),
)
