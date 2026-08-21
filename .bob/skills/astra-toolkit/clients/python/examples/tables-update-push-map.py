from astrapy import DataAPIClient
from astrapy.data_types import DataAPIMap

# Get an existing table
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
table = database.get_table("**TABLE_NAME**")

# Update a row
table.update_one(
    {"title": "Hidden Shadows of the Past", "author": "John Anthony"},
    {
        "$push": {
            # This update includes non-string keys,
            # so the update is a key-value pair represented as an array
            "map_column_int_str": [1, "value1"],
            # This update does not include non-string keys,
            # so the update can be a key-value pair represented as an array or a map
            "map_column_str_str": {"key1": "value1"},
            # When using $each, use an array of key-value pairs for non-string keys
            "map_column_int_str_2": {
                "$each": [[1, "value1"], [2, "value2"]]
            },
            # When using $each, use an array of key-value pairs or maps for string keys
            "map_column_str_str_2": {
                "$each": [{"key1": "value1"}, ["key2", "value2"]]
            },
        }
    },
)
