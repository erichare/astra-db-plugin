from astrapy import DataAPIClient

# Get an admin object
client = DataAPIClient("**APPLICATION_TOKEN**")
admin = client.get_admin()
