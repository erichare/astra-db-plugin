from astrapy import DataAPIClient

# Get an existing table
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
table = database.get_table("**TABLE_NAME**")

# Create the filter
filter = {
    "$and": [
        {"is_checked_out": False},
        {"number_of_pages": {"$lt": 300}},
    ]
}

# Get the first page
cursor_1 = table.find(filter)
page_1 = cursor_1.fetch_next_page()
results_1 = page_1.results
for row in results_1:
    print(row)
pagination_state_1 = page_1.next_page_state

# Get the next page
if pagination_state_1:
    cursor_2 = table.find(filter, initial_page_state=pagination_state_1)
    page_2 = cursor_2.fetch_next_page()
    results_2 = page_2.results
    for row in results_2:
        print(row)
    pagination_state_2 = page_2.next_page_state
