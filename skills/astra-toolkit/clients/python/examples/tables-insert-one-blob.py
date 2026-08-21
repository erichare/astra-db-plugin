from astrapy import DataAPIClient

# Get an existing table
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
table = database.get_table("**TABLE_NAME**")

# Insert binary values
result = table.insert_one(
    {
        "example_blob": b"=\xfb\xe7m>\xe9x\xd5?I\xfb\xe7",
        "another_example_blob": {"$binary": "PfvnbT7peNU/Sfvn"},
        "title": "Example",
    }
)
