from astrapy import DataAPIClient
from astrapy.constants import SortMode

# Get an existing table
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
table = database.get_table("**TABLE_NAME**")

# Find rows
cursor = table.find(
    {"is_checked_out": False},
    sort={
        "rating": SortMode.ASCENDING,
        "title": SortMode.DESCENDING,
    },
    skip=5,
)

# Iterate over the found rows
for row in cursor:
    print(row)
