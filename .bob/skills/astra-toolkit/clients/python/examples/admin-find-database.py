from astrapy import DataAPIClient

client = DataAPIClient("**APPLICATION_TOKEN**")

admin = client.get_admin()

database_info = admin.database_info("**DATABASE_ID**")

print(database_info)
