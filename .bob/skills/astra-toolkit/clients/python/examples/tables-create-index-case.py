from astrapy import DataAPIClient
from astrapy.info import TableIndexOptions

# Get an existing table
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
table = database.get_table("**TABLE_NAME**")

# Index a column
table.create_index(
    "**INDEX_NAME**",
    column="**COLUMN_NAME**",
    options=TableIndexOptions(
        case_sensitive=False,
    ),
)
