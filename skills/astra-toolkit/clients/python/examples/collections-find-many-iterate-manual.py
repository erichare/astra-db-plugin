from astrapy import DataAPIClient

# Get an existing collection
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
collection = database.get_collection("**COLLECTION_NAME**")

# Create the filter
filter = {
    "$and": [
        {"is_checked_out": False},
        {"number_of_pages": {"$lt": 300}},
    ]
}

# Get the first page
cursor_1 = collection.find(filter)
page_1 = cursor_1.fetch_next_page()
results_1 = page_1.results
for document in results_1:
    print(document)
pagination_state_1 = page_1.next_page_state

# Get the next page
if pagination_state_1:
    cursor_2 = collection.find(
        filter,
        initial_page_state=pagination_state_1,
    )
    page_2 = cursor_2.fetch_next_page()
    results_2 = page_2.results
    for document in results_2:
        print(document)
    pagination_state_2 = page_2.next_page_state
