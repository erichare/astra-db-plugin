from astrapy import DataAPIClient

client = DataAPIClient("**APPLICATION_TOKEN**")

admin = client.get_admin()

regions = admin.find_available_regions()

print(regions)
