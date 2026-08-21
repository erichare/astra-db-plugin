from astrapy import DataAPIClient

# Get a database object
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)

# Get a database admin object
database_admin = database.get_database_admin()
