import os
from astrapy import DataAPIClient

client = DataAPIClient(os.environ["ASTRA_DB_APPLICATION_TOKEN"])

admin = client.get_admin()

database_admin = admin.get_database_admin(os.environ["ASTRA_DB_API_ENDPOINT"])

providers = database_admin.find_embedding_providers()

# Use the raw dict
print(providers.raw_info)

# Or work with the resulting object:

print(providers.embedding_providers.keys())

print(providers.embedding_providers["openai"])

print(providers.embedding_providers["openai"].parameters)

print(providers.embedding_providers["openai"].supported_authentication)

print(providers.embedding_providers["openai"].models[0])

print(providers.embedding_providers["openai"].models[0].parameters)
