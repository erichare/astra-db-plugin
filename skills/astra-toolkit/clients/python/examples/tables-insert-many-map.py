from astrapy import DataAPIClient
from astrapy.data_types import DataAPIMap

# Get an existing table
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
table = database.get_table("**TABLE_NAME**")

# Insert rows into the table
result = table.insert_many(
    [
        {
            # This map has non-string keys,
            # so the insertion is an array of key-value pairs
            "map_column_int_str": [[1, "value1"], [2, "value2"]],
            # Alternatively, use DataAPIMap to encode maps with non-string keys
            "map_column_int_str_2": DataAPIMap(
                {1: "value1", 2: "value2"}
            ),
            # This map does not have non-string keys,
            # so the insertion does not need to be an array of key-value pairs
            "map_column_str_str": {"key1": "value1", "key2": "value2"},
            "title": "Once in a Living Memory",
            "author": "Kayla McMaster",
        },
    ]
)
