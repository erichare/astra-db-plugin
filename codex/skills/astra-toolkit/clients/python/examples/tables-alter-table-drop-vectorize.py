from astrapy import DataAPIClient
from astrapy.info import AlterTableDropVectorize

# Get an existing table
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
table = database.get_table("**TABLE_NAME**")

# Remove automatic embedding generation
table.alter(
    AlterTableDropVectorize(
        columns=["plot_synopsis"],
    ),
)
