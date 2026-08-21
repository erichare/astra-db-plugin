from astrapy import DataAPIClient
from astrapy.data_types import DataAPIVector

# Get an existing table
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
table = database.get_table("**TABLE_NAME**")

# Find rows
cursor = table.find(
    {},
    sort={"summary_genres_vector": DataAPIVector([0.08, -0.62, 0.39])},
    include_similarity=True,
)

# Iterate over the found rows
for row in cursor:
    print(row["$similarity"])
