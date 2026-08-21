from astrapy import DataAPIClient

client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)

old_collection = database.get_collection("**OLD_COLLECTION_NAME**")
new_collection = database.get_collection("**NEW_COLLECTION_NAME**")

page_state = None
migrated_count = 0

# Use an empty filter to migrate all documents
filter = {}

# You must explicitly include $vectorize.
# $vector is excluded by default.
# _id and any other fields that don't start with $ are included by default.
projection = {"$vectorize": True}

while True:
    if page_state:
        cursor = old_collection.find(
            filter, projection=projection, initial_page_state=page_state
        )
    else:
        cursor = old_collection.find(filter, projection=projection)

    page = cursor.fetch_next_page()
    documents = page.results
    page_state = page.next_page_state

    if not documents:
        print("No more documents. Migration complete.")
        break

    # Insert the documents to the new collection.
    # _id and the other field values (excluding $vector) will be the same.
    # $vector will automatically be generated based on the value $vectorize.
    new_collection.insert_many(documents)

    migrated_count += len(documents)

    print(
        f"Migrated {migrated_count} documents. Page state: {page_state}"
    )

    if page_state is None:
        print("Reached final page. Migration complete.")
        break
