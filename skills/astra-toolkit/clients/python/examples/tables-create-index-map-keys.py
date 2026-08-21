from astrapy import DataAPIClient

# Get an existing table
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
table = database.get_table("**TABLE_NAME**")

# Index a the keys of a map column
table.create_index(
    name="**INDEX_NAME**", column={"**MAP_COLUMN_NAME**": "$keys"}
)
