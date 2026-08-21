# tag::imports-definition[]
from astrapy import DataAPIClient
from astrapy.info import (
    AlterTableAddVectorize,
    VectorServiceOptions,
)
# end::imports-definition[]

# tag::pre-table-definition[]

# Get an existing table
client = DataAPIClient("APPLICATION_TOKEN")
database = client.get_database("API_ENDPOINT")
table = database.get_table("TABLE_NAME")

# end::pre-table-definition[]

# tag::table-definition-external-provider[]
# Configure an embedding provider for a column
table.alter(
    AlterTableAddVectorize(
        columns={
            "VECTOR_COLUMN_NAME": VectorServiceOptions(
                provider="{embedding-provider-name-api}",
                model_name="MODEL_NAME",
                authentication={
                    "providerKey": "API_KEY_NAME",
                },
            ),
        },
    )
)
# end::table-definition-external-provider[]

# tag::table-definition-hugging-face-dedicated[]
# Configure an embedding provider for a column
table.alter(
    AlterTableAddVectorize(
        columns={
        "VECTOR_COLUMN_NAME": VectorServiceOptions(
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
            ),
        },
    )
)
# end::table-definition-hugging-face-dedicated[]

# tag::table-definition-openai[]
# Configure an embedding provider for a column
table.alter(
    AlterTableAddVectorize(
        columns={
            "VECTOR_COLUMN_NAME": VectorServiceOptions(
                provider="{embedding-provider-name-api}",
                model_name="MODEL_NAME",
                authentication={
                    "providerKey": "API_KEY_NAME",
                },
                parameters={
                    "organizationId": "ORGANIZATION_ID",
                    "projectId": "PROJECT_ID",
                },
            ),
        },
    )
)
# end::table-definition-openai[]

# tag::table-definition-azure-openai[]
# Configure an embedding provider for a column
table.alter(
    AlterTableAddVectorize(
        columns={
            "VECTOR_COLUMN_NAME": VectorServiceOptions(
                provider="{embedding-provider-name-api}",
                model_name="MODEL_NAME",
                authentication={
                    "providerKey": "API_KEY_NAME",
                },
                parameters={
                    "resourceName": "RESOURCE_NAME",
                    "deploymentId": "DEPLOYMENT_ID",
                },
            ),
        },
    )
)
# end::table-definition-azure-openai[]

# tag::table-definition-hosted-provider[]
# Configure an embedding provider for a column
table.alter(
    AlterTableAddVectorize(
        columns={
            "VECTOR_COLUMN_NAME": VectorServiceOptions(
                provider="{embedding-provider-name-api}",
                model_name="{embedding-provider-model-name-api}",
            ),
        },
    )
)
# end::table-definition-hosted-provider[]
