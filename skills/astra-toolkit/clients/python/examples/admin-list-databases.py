from astrapy import DataAPIClient

client = DataAPIClient("**APPLICATION_TOKEN**")

admin = client.get_admin()

databases = admin.list_databases()

print(databases)
