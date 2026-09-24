import os
from astrapy import DataAPIClient

client = DataAPIClient(os.environ["ASTRA_DB_APPLICATION_TOKEN"])

admin = client.get_admin()

database_admin = admin.get_database_admin(os.environ["ASTRA_DB_API_ENDPOINT"])

providers = database_admin.find_reranking_providers()

# Use the raw dict
print(providers.raw_info)

# Or work with the resulting object:

print(providers.reranking_providers.keys())

print(providers.reranking_providers["nvidia"])

print(providers.reranking_providers["nvidia"].models[0])
