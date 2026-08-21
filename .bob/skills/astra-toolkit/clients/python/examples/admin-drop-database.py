from astrapy import DataAPIClient

client = DataAPIClient("**APPLICATION_TOKEN**")

admin = client.get_admin()

admin.drop_database("**DATABASE_ID**")
