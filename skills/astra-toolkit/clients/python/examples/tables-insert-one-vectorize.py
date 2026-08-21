from astrapy import DataAPIClient

# Get an existing table
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
table = database.get_table("**TABLE_NAME**")

# Insert a row into the table
result = table.insert_one(
    {
        "title": "Computed Wilderness",
        "author": "Ryan Eau",
        "summary_genres_vector": "Text to vectorize",
        "summary_genres_original_text": "Text to vectorize",
    }
)
