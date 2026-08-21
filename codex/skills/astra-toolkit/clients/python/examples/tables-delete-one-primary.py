from astrapy import DataAPIClient

# Get an existing table
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
table = database.get_table("**TABLE_NAME**")

# Delete a row
table.delete_one(
    {"title": "Hidden Shadows of the Past", "author": "John Anthony"}
)
