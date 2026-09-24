import os
from astrapy import DataAPIClient
from astrapy.info import TableTextIndexOptions

# Get an existing table
client = DataAPIClient()
database = client.get_database(
    os.environ["ASTRA_DB_API_ENDPOINT"], token=os.environ["ASTRA_DB_APPLICATION_TOKEN"]
)
table = database.get_table("**TABLE_NAME**")

# Index a column
table.create_text_index(
    "**INDEX_NAME**",
    column="**TEXT_COLUMN_NAME**",
    options=TableTextIndexOptions(
        analyzer={
            "tokenizer": {"name": "standard", "args": {}},
            "filters": [
                {"name": "lowercase"},
                {"name": "stop"},
                {"name": "porterstem"},
                {"name": "asciifolding"},
            ],
            "charFilters": [],
        },
    ),
)
