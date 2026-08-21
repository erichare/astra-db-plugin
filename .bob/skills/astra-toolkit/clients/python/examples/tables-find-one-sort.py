from astrapy import DataAPIClient
from astrapy.constants import SortMode

# Get an existing table
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
table = database.get_table("**TABLE_NAME**")

# Find a row
result = table.find_one(
    {"is_checked_out": False},
    sort={
        "rating": SortMode.ASCENDING,
        "title": SortMode.DESCENDING,
    },
)

print(result)
