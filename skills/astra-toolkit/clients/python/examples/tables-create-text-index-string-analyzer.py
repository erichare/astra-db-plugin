from astrapy import DataAPIClient
from astrapy.info import TableTextIndexOptions

# Get an existing table
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
table = database.get_table("**TABLE_NAME**")

# Index a column
table.create_text_index(
    "**INDEX_NAME**",
    column="**TEXT_COLUMN_NAME**",
    options=TableTextIndexOptions(
        analyzer="english",
    ),
)
