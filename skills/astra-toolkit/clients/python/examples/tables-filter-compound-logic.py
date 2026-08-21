from astrapy import DataAPIClient

# Get an existing table
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
table = database.get_table("**TABLE_NAME**")

# Find a row
result = table.find_one(
    {
        "$and": [
            {
                "$or": [
                    {"is_checked_out": False},
                    {"number_of_pages": {"$lt": 300}},
                ]
            },
            {
                "$or": [
                    {"rating": {"$lt": 4.3}},
                    {"publication_year": {"$gte": 2002}},
                ]
            },
        ]
    }
)

print(result)
