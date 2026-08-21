from astrapy import DataAPIClient
from astrapy.info import AlterTableDropColumns

# Get an existing table
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
table = database.get_table("**TABLE_NAME**")

# Drop columns
table.alter(
    AlterTableDropColumns(
        columns=["is_summer_reading", "library_branch"],
    ),
)
