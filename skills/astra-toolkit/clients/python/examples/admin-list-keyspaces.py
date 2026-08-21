from astrapy import DataAPIClient

# Get a database
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)

# Get an admin object
admin = database.get_database_admin()

# List keyspaces
keyspaces = admin.list_keyspaces()

print(keyspaces)
