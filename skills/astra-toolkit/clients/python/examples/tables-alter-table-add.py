import os
from astrapy import DataAPIClient
from astrapy.info import (
    AlterTableAddColumns,
    ColumnType,
    TableScalarColumnTypeDescriptor,
)

# Get an existing table
client = DataAPIClient()
database = client.get_database(
    os.environ["ASTRA_DB_API_ENDPOINT"], token=os.environ["ASTRA_DB_APPLICATION_TOKEN"]
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
