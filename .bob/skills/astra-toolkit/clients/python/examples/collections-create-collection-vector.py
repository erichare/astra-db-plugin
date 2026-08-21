from astrapy import DataAPIClient
from astrapy.constants import VectorMetric
from astrapy.info import CollectionDefinition, CollectionVectorOptions

# Get an existing database
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)

# Create a collection
collection_definition = CollectionDefinition(
    vector=CollectionVectorOptions(
        dimension=1024, metric=VectorMetric.COSINE, source_model="nv-qa-4"
    ),
)
collection = database.create_collection(
    "**COLLECTION_NAME**",
    definition=collection_definition,
)

# ==============  BOUNDARY BETWEEN EXAMPLE SNIPPETS  ==============

from astrapy import DataAPIClient
from astrapy.constants import VectorMetric
from astrapy.info import CollectionDefinition

# Get an existing database
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)

collection_definition = (
    CollectionDefinition.builder()
    .set_vector_dimension(1024)
    .set_vector_metric(VectorMetric.COSINE)
    .set_vector_source_model("nv-qa-4")
    .build()
)

collection = database.create_collection(
    "**COLLECTION_NAME**",
    definition=collection_definition,
)
