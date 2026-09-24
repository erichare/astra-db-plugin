import os
from astrapy import DataAPIClient
from astrapy.info import TableIndexOptions

# Get an existing table
client = DataAPIClient()
database = client.get_database(
    os.environ["ASTRA_DB_API_ENDPOINT"], token=os.environ["ASTRA_DB_APPLICATION_TOKEN"]
)
table = database.get_table("**TABLE_NAME**")

# Index a column
table.create_index(
    "**INDEX_NAME**",
    column="**COLUMN_NAME**",
    options=TableIndexOptions(
        ascii=True,
    ),
)
