from astrapy import DataAPIClient
from astrapy.constants import VectorMetric
from astrapy.info import TableVectorIndexOptions

# Get an existing table
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
table = database.get_table("**TABLE_NAME**")

# Index a vector column
table.create_vector_index(
    "**INDEX_NAME**",
    column="**VECTOR_COLUMN_NAME**",
    options=TableVectorIndexOptions(
        metric=VectorMetric.DOT_PRODUCT,
        source_model="nv-qa-4",
    ),
)
