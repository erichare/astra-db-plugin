from astrapy import DataAPIClient

# Get a database
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)

# Get an admin object
admin = database.get_database_admin()

# Create a keyspace
admin.create_keyspace("**KEYSPACE_NAME**")
