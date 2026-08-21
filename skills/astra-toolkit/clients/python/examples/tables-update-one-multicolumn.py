from astrapy import DataAPIClient

# Get an existing table
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
table = database.get_table("**TABLE_NAME**")

# Update a row
table.update_one(
    {"title": "Hidden Shadows of the Past", "author": "John Anthony"},
    {
        "$set": {"rating": 4.5, "genres": ["Fiction", "Drama"]},
        "$unset": {"borrower": ""},
    },
)
