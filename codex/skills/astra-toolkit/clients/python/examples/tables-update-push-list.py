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
        "$push": {
            # Appends a single element to the "genres" list
            "genres": "SciFi",
            # Appends two elements to the "topics" list
            "topics": {"$each": ["robots", "AI"]},
        }
    },
)
