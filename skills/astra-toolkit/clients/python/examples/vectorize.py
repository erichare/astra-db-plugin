# tag::pre-collection-definition[]
from astrapy import DataAPIClient
from astrapy.constants import VectorMetric
from astrapy.info import (
    CollectionDefinition,
    CollectionVectorOptions,
    VectorServiceOptions,
)

# Instantiate the client
client = DataAPIClient()

# Connect to a database
database = client.get_database(
    "API_ENDPOINT",
    token="APPLICATION_TOKEN"
)
# end::pre-collection-definition[]

# tag::collection-definition-external-provider[]

# Define the collection
collection_definition = CollectionDefinition(
    vector=CollectionVectorOptions(
        metric=VectorMetric.SIMILARITY_METRIC,
        dimension=MODEL_DIMENSIONS,
        service=VectorServiceOptions(
            provider="{embedding-provider-name-api}",
            model_name="MODEL_NAME",
            authentication={
                "providerKey": "API_KEY_NAME",
            },
        )
    )
)
# end::collection-definition-external-provider[]

# tag::collection-definition-fluent-external-provider[]

# Define the collection
collection_definition = (
    CollectionDefinition.builder()
    .set_vector_dimension(MODEL_DIMENSIONS)
    .set_vector_metric(VectorMetric.SIMILARITY_METRIC)
    .set_vector_service(
        provider="{embedding-provider-name-api}",
        model_name="MODEL_NAME",
        authentication={
            "providerKey": "API_KEY_NAME",
        }
    )
    .build()
)
# end::collection-definition-fluent-external-provider[]

# tag::collection-definition-hugging-face-dedicated[]

# Define the collection
collection_definition = CollectionDefinition(
    vector=CollectionVectorOptions(
        metric=VectorMetric.SIMILARITY_METRIC,
        dimension=MODEL_DIMENSIONS,
        service=VectorServiceOptions(
            provider="{embedding-provider-name-api}",
            model_name="{embedding-provider-model-name-api}",
            authentication={
                "providerKey": "API_KEY_NAME",
            },
            parameters={
                "endpointName": "ENDPOINT_NAME",
                "regionName": "REGION",
                "cloudName": "CLOUD_PROVIDER",
            },
        )
    )
)
# end::collection-definition-hugging-face-dedicated[]

# tag::collection-definition-fluent-hugging-face-dedicated[]

# Define the collection
collection_definition = (
    CollectionDefinition.builder()
    .set_vector_dimension(MODEL_DIMENSIONS)
    .set_vector_metric(VectorMetric.SIMILARITY_METRIC)
    .set_vector_service(
        provider="{embedding-provider-name-api}",
        model_name="{embedding-provider-model-name-api}",
        authentication={
            "providerKey": "API_KEY_NAME",
        },
        parameters={
            "endpointName": "ENDPOINT_NAME",
            "regionName": "REGION",
            "cloudName": "CLOUD_PROVIDER",
        },
    )
    .build()
)
# end::collection-definition-fluent-hugging-face-dedicated[]

# tag::collection-definition-openai[]

# Define the collection
collection_definition = CollectionDefinition(
    vector=CollectionVectorOptions(
        metric=VectorMetric.SIMILARITY_METRIC,
        dimension=MODEL_DIMENSIONS,
        service=VectorServiceOptions(
            provider="{embedding-provider-name-api}",
            model_name="MODEL_NAME",
            authentication={
                "providerKey": "API_KEY_NAME",
            },
            parameters={
                "organizationId": "ORGANIZATION_ID",
                "projectId": "PROJECT_ID",
            },
        )
    )
)
# end::collection-definition-openai[]

# tag::collection-definition-fluent-openai[]

# Define the collection
collection_definition = (
    CollectionDefinition.builder()
    .set_vector_dimension(MODEL_DIMENSIONS)
    .set_vector_metric(VectorMetric.SIMILARITY_METRIC)
    .set_vector_service(
        provider="{embedding-provider-name-api}",
        model_name="MODEL_NAME",
        authentication={
            "providerKey": "API_KEY_NAME",
        },
        parameters={
            "organizationId": "ORGANIZATION_ID",
            "projectId": "PROJECT_ID",
        },
    )
    .build()
)
# end::collection-definition-fluent-openai[]

# tag::collection-definition-azure-openai[]

# Define the collection
collection_definition = CollectionDefinition(
    vector=CollectionVectorOptions(
        metric=VectorMetric.SIMILARITY_METRIC,
        dimension=MODEL_DIMENSIONS,
        service=VectorServiceOptions(
            provider="{embedding-provider-name-api}",
            model_name="MODEL_NAME",
            authentication={
                "providerKey": "API_KEY_NAME",
            },
            parameters={
                "resourceName": "RESOURCE_NAME",
                "deploymentId": "DEPLOYMENT_ID",
            },
        )
    )
)
# end::collection-definition-azure-openai[]

# tag::collection-definition-fluent-azure-openai[]

# Define the collection
collection_definition = (
    CollectionDefinition.builder()
    .set_vector_dimension(MODEL_DIMENSIONS)
    .set_vector_metric(VectorMetric.SIMILARITY_METRIC)
    .set_vector_service(
        provider="{embedding-provider-name-api}",
        model_name="MODEL_NAME",
        authentication={
            "providerKey": "API_KEY_NAME",
        },
        parameters={
            "resourceName": "RESOURCE_NAME",
            "deploymentId": "DEPLOYMENT_ID",
        },
    )
    .build()
)
# end::collection-definition-fluent-azure-openai[]

# tag::collection-definition-hosted-provider[]

# Define the collection
collection_definition = CollectionDefinition(
    vector=CollectionVectorOptions(
        metric=VectorMetric.COSINE,
        service=VectorServiceOptions(
            provider="{embedding-provider-name-api}",
            model_name="{embedding-provider-model-name-api}",
        )
    )
)
# end::collection-definition-hosted-provider[]

# tag::collection-definition-fluent-hosted-provider[]

# Define the collection
collection_definition = (
    CollectionDefinition.builder()
    .set_vector_metric(VectorMetric.COSINE)
    .set_vector_service(
        provider="{embedding-provider-name-api}",
        model_name="{embedding-provider-model-name-api}"
    )
    .build()
)
# end::collection-definition-fluent-hosted-provider[]

# tag::post-collection-definition[]

# Create the collection
collection = database.create_collection(
    "COLLECTION_NAME",
    definition=collection_definition,
)

print(f"* Collection: {collection.full_name}\n")
# end::post-collection-definition[]
