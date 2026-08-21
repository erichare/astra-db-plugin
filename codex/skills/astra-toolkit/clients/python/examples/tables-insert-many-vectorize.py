from astrapy import DataAPIClient

# Get an existing table
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
table = database.get_table("**TABLE_NAME**")

# Insert rows into the table
result = table.insert_many(
    [
        {
            "title": "Computed Wilderness",
            "author": "Ryan Eau",
            "summary_genres_vector": "Text to vectorize",
            "summary_genres_original_text": "Text to vectorize",
        },
        {
            "title": "Desert Peace",
            "author": "Walter Dray",
            "summary_genres_vector": "Text to vectorize",
            "summary_genres_original_text": "Text to vectorize",
        },
    ]
)
