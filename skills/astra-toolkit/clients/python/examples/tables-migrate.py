from astrapy import DataAPIClient

client = DataAPIClient("APPLICATION_TOKEN")
database = client.get_database("API_ENDPOINT")

table = database.get_table("TABLE_NAME")

page_state = None
migrated_count = 0

# Use an empty filter to find all rows
filter = {}

# You must include ALL primary key columns for your table
primary_key_columns = [
    "pass:q[**PRIMARY_KEY_1**]",
    "pass:q[**PRIMARY_KEY_2**]",
]

original_text_column = "NAME_OF_ORIGINAL_TEXT_COLUMN"

new_vector_column = "NAME_OF_NEW_VECTOR_COLUMN"

# The projection should include ALL primary key columns
# and the column that stores the original text
projection = {
    **{column: True for column in primary_key_columns},
    original_text_column: True,
}

while True:
    if page_state:
        cursor = table.find(
            filter, projection=projection, initial_page_state=page_state
        )
    else:
        cursor = table.find(filter, projection=projection)

    page = cursor.fetch_next_page()
    rows = page.results
    page_state = page.next_page_state

    if not rows:
        print("No more rows. Migration complete.")
        break

    # Build the updates
    updated_rows = []
    for row in rows:
        if text := row.get(original_text_column):
            updated_row = {
                # Include the full primary key
                **{column: row[column] for column in primary_key_columns},
                # Set the new vector column to the original text
                new_vector_column: text,
            }
            updated_rows.append(updated_row)

    # Inserting a row with a primary key that already exists in the table will
    # overwrite the specified column but leave unspecified columns unchanged.
    table.insert_many(updated_rows)
    migrated_count += len(updated_rows)

    print(f"Migrated {migrated_count} rows. Page state: {page_state}")

    if page_state is None:
        print("Reached final page. Migration complete.")
        break
