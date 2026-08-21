from astrapy import DataAPIClient

# Get an existing table
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
table = database.get_table("**TABLE_NAME**")

# Find rows
cursor = table.find(
    {"number_of_pages": {"$lt": 300}},
    projection={"is_checked_out": True, "title": True},
)

# Iterate over the found rows
for row in cursor:
    print(row)
