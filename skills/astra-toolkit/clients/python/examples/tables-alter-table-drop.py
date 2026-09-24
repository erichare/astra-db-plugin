import os
from astrapy import DataAPIClient
from astrapy.info import AlterTableDropColumns

# Get an existing table
client = DataAPIClient()
database = client.get_database(
    os.environ["ASTRA_DB_API_ENDPOINT"], token=os.environ["ASTRA_DB_APPLICATION_TOKEN"]
)
table = database.get_table("**TABLE_NAME**")

# Drop columns
table.alter(
    AlterTableDropColumns(
        columns=["is_summer_reading", "library_branch"],
    ),
)
