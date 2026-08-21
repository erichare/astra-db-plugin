# tag::imports-definition[]
from astrapy import DataAPIClient
from astrapy.info import (
    AlterTableAddColumns,
    TableVectorColumnTypeDescriptor,
    VectorServiceOptions,
    TableScalarColumnTypeDescriptor,
    ColumnType
)
# end::imports-definition[]

# tag::pre-table-definition[]

# Get an existing table
client = DataAPIClient("APPLICATION_TOKEN")
database = client.get_database("API_ENDPOINT")
table = database.get_table("TABLE_NAME")

# end::pre-table-definition[]

# tag::table-definition-external-provider[]
# Add a vector column and configure an embedding provider
table.alter(
    AlterTableAddColumns(
        columns={
            # This column will store vector embeddings.
            # The {embedding-provider-name} integration
            # will automatically generate vector embeddings
            # for any text inserted to this column.
            "VECTOR_COLUMN_NAME": TableVectorColumnTypeDescriptor(
                dimension=MODEL_DIMENSIONS,
                service=VectorServiceOptions(
                    provider="{embedding-provider-name-api}",
                    model_name="MODEL_NAME",
                    authentication={
                        "providerKey": "API_KEY_NAME",
                    },
                ),
            ),
            # If you want to store the original text
            # in addition to the generated embeddings
            # you must create a separate column.
            "TEXT_COLUMN_NAME": TableScalarColumnTypeDescriptor(
                column_type=ColumnType.TEXT
            ),
        },
    )
)
# end::table-definition-external-provider[]

# tag::table-definition-hugging-face-dedicated[]
# Add a vector column and configure an embedding provider
table.alter(
    AlterTableAddColumns(
        columns={
            # This column will store vector embeddings.
            # The {embedding-provider-name} integration
            # will automatically generate vector embeddings
            # for any text inserted to this column.
            "VECTOR_COLUMN_NAME": TableVectorColumnTypeDescriptor(
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
                ),
            ),
            # If you want to store the original text
            # in addition to the generated embeddings
            # you must create a separate column.
            "TEXT_COLUMN_NAME": TableScalarColumnTypeDescriptor(
                column_type=ColumnType.TEXT
            ),
        },
    )
)
# end::table-definition-hugging-face-dedicated[]

# tag::table-definition-openai[]
# Add a vector column and configure an embedding provider
table.alter(
    AlterTableAddColumns(
        columns={
            # This column will store vector embeddings.
            # The {embedding-provider-name} integration
            # will automatically generate vector embeddings
            # for any text inserted to this column.
            "VECTOR_COLUMN_NAME": TableVectorColumnTypeDescriptor(
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
                ),
            ),
            # If you want to store the original text
            # in addition to the generated embeddings
            # you must create a separate column.
            "TEXT_COLUMN_NAME": TableScalarColumnTypeDescriptor(
                column_type=ColumnType.TEXT
            ),
        },
    )
)
# end::table-definition-openai[]

# tag::table-definition-azure-openai[]
# Add a vector column and configure an embedding provider
table.alter(
    AlterTableAddColumns(
        columns={
            # This column will store vector embeddings.
            # The {embedding-provider-name} integration
            # will automatically generate vector embeddings
            # for any text inserted to this column.
            "VECTOR_COLUMN_NAME": TableVectorColumnTypeDescriptor(
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
                ),
            ),
            # If you want to store the original text
            # in addition to the generated embeddings
            # you must create a separate column.
            "TEXT_COLUMN_NAME": TableScalarColumnTypeDescriptor(
                column_type=ColumnType.TEXT
            ),
        },
    )
)
# end::table-definition-azure-openai[]

# tag::table-definition-hosted-provider[]
# Add a vector column and configure an embedding provider
table.alter(
    AlterTableAddColumns(
        columns={
            # This column will store vector embeddings.
            # The {embedding-provider-name} integration
            # will automatically generate vector embeddings
            # for any text inserted to this column.
            "VECTOR_COLUMN_NAME": TableVectorColumnTypeDescriptor(
                service=VectorServiceOptions(
                    provider="{embedding-provider-name-api}",
                    model_name="{embedding-provider-model-name-api}",
                ),
            ),
            # If you want to store the original text
            # in addition to the generated embeddings
            # you must create a separate column.
            "TEXT_COLUMN_NAME": TableScalarColumnTypeDescriptor(
                column_type=ColumnType.TEXT
            ),
        },
    )
)
# end::table-definition-hosted-provider[]
