from astrapy import DataAPIClient

# Get an existing table
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
table = database.get_table("**TABLE_NAME**")

# Find a row
result = table.find_one(
    {"author": {"$in": ["Sara Jones", "Jennifer Ray"]}}
)

print(result)
