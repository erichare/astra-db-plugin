# tag::imports-definition[]
from astrapy import DataAPIClient
from astrapy.constants import VectorMetric
from astrapy.info import (
    CreateTableDefinition,
    ColumnType,
    TableScalarColumnTypeDescriptor,
    TablePrimaryKeyDescriptor,
    TableVectorColumnTypeDescriptor,
    VectorServiceOptions
)
# end::imports-definition[]

# tag::imports-fluent[]
from astrapy import DataAPIClient
from astrapy.constants import VectorMetric
from astrapy.info import CreateTableDefinition, ColumnType, VectorServiceOptions
# end::imports-fluent[]

# tag::imports-dictionary[]
from astrapy import DataAPIClient
# end::imports-dictionary[]

# tag::pre-table-definition[]

# Instantiate the client
client = DataAPIClient()

# Connect to a database
database = client.get_database(
    "API_ENDPOINT",
    token="APPLICATION_TOKEN"
)
# end::pre-table-definition[]

# tag::table-definition-external-provider[]

# Define the columns and primary key for the table
table_definition = CreateTableDefinition(
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
    # You should change the primary key definition to meet the needs of your data.
    primary_key=TablePrimaryKeyDescriptor(
        partition_by=["TEXT_COLUMN_NAME"],
        partition_sort={}
    ),
)
# end::table-definition-external-provider[]

# tag::table-definition-fluent-external-provider[]

# Define the columns and primary key for the table
table_definition = (
    CreateTableDefinition.builder()
    # This column will store vector embeddings.
    # The {embedding-provider-name} integration
    # will automatically generate vector embeddings
    # for any text inserted to this column.
    .add_vector_column("VECTOR_COLUMN_NAME",
        dimension=MODEL_DIMENSIONS,
        service=VectorServiceOptions(
            provider="{embedding-provider-name-api}",
            model_name="MODEL_NAME",
            authentication={
                "providerKey": "API_KEY_NAME",
            },
        ),
    )
    # If you want to store the original text
    # in addition to the generated embeddings
    # you must create a separate column.
    .add_column("TEXT_COLUMN_NAME", ColumnType.TEXT)
    # You should change the primary key definition to meet the needs of your data.
    .add_partition_by(["TEXT_COLUMN_NAME"])
    # Finally, build the table definition.
    .build()
)
# end::table-definition-fluent-external-provider[]


# tag::table-definition-dictionary-external-provider[]

# Define the columns and primary key for the table
table_definition = {
    "columns": {
        # This column will store vector embeddings.
        # The {embedding-provider-name} integration
        # will automatically generate vector embeddings
        # for any text inserted to this column.
        "VECTOR_COLUMN_NAME": {
          "type": "vector",
          "dimension": MODEL_DIMENSIONS,
          "service": {
            "provider": "{embedding-provider-name-api}",
            "model_name": "MODEL_NAME",
            "authentication": {
                "providerKey": "API_KEY_NAME",
            },
          }
        },
        # If you want to store the original text
        # in addition to the generated embeddings
        # you must create a separate column.
        "TEXT_COLUMN_NAME": {"type": "text"},
    },
    # You should change the primary key definition to meet the needs of your data.
    "primaryKey": {
        "partitionBy": ["TEXT_COLUMN_NAME"],
        "partitionSort": {},
    },
}
# end::table-definition-dictionary-external-provider[]

# tag::table-definition-hugging-face-dedicated[]

# Define the columns and primary key for the table
table_definition = CreateTableDefinition(
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
    # You should change the primary key definition to meet the needs of your data.
    primary_key=TablePrimaryKeyDescriptor(
        partition_by=["TEXT_COLUMN_NAME"],
        partition_sort={}
    ),
)
# end::table-definition-hugging-face-dedicated[]

# tag::table-definition-fluent-hugging-face-dedicated[]

# Define the columns and primary key for the table
table_definition = (
    CreateTableDefinition.builder()
    # This column will store vector embeddings.
    # The {embedding-provider-name} integration
    # will automatically generate vector embeddings
    # for any text inserted to this column.
    .add_vector_column("VECTOR_COLUMN_NAME",
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
    )
    # If you want to store the original text
    # in addition to the generated embeddings
    # you must create a separate column.
    .add_column("TEXT_COLUMN_NAME", ColumnType.TEXT)
    # You should change the primary key definition to meet the needs of your data.
    .add_partition_by(["TEXT_COLUMN_NAME"])
    # Finally, build the table definition.
    .build()
)
# end::table-definition-fluent-hugging-face-dedicated[]

# tag::table-definition-dictionary-hugging-face-dedicated[]

# Define the columns and primary key for the table
table_definition = {
    "columns": {
        # This column will store vector embeddings.
        # The {embedding-provider-name} integration
        # will automatically generate vector embeddings
        # for any text inserted to this column.
        "VECTOR_COLUMN_NAME": {
          "type": "vector",
          "dimension": MODEL_DIMENSIONS,
          "service": {
            "provider": "{embedding-provider-name-api}",
            "model_name": "{embedding-provider-model-name-api}",
            "authentication": {
                "providerKey": "API_KEY_NAME",
            },
            "parameters": {
                "endpointName": "ENDPOINT_NAME",
                "regionName": "REGION",
                "cloudName": "CLOUD_PROVIDER",
            },
          }
        },
        # If you want to store the original text
        # in addition to the generated embeddings
        # you must create a separate column.
        "TEXT_COLUMN_NAME": {"type": "text"},
    },
    # You should change the primary key definition to meet the needs of your data.
    "primaryKey": {
        "partitionBy": ["TEXT_COLUMN_NAME"],
        "partitionSort": {},
    },
}
# end::table-definition-dictionary-hugging-face-dedicated[]

# tag::table-definition-openai[]

# Define the columns and primary key for the table
table_definition = CreateTableDefinition(
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
    # You should change the primary key definition to meet the needs of your data.
    primary_key=TablePrimaryKeyDescriptor(
        partition_by=["TEXT_COLUMN_NAME"],
        partition_sort={}
    ),
)
# end::table-definition-openai[]

# tag::table-definition-fluent-openai[]

# Define the columns and primary key for the table
table_definition = (
    CreateTableDefinition.builder()
    # This column will store vector embeddings.
    # The {embedding-provider-name} integration
    # will automatically generate vector embeddings
    # for any text inserted to this column.
    .add_vector_column("VECTOR_COLUMN_NAME",
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
    )
    # If you want to store the original text
    # in addition to the generated embeddings
    # you must create a separate column.
    .add_column("TEXT_COLUMN_NAME", ColumnType.TEXT)
    # You should change the primary key definition to meet the needs of your data.
    .add_partition_by(["TEXT_COLUMN_NAME"])
    # Finally, build the table definition.
    .build()
)
# end::table-definition-fluent-openai[]


# tag::table-definition-dictionary-openai[]

# Define the columns and primary key for the table
table_definition = {
    "columns": {
        # This column will store vector embeddings.
        # The {embedding-provider-name} integration
        # will automatically generate vector embeddings
        # for any text inserted to this column.
        "VECTOR_COLUMN_NAME": {
          "type": "vector",
          "dimension": MODEL_DIMENSIONS,
          "service": {
            "provider": "{embedding-provider-name-api}",
            "model_name": "MODEL_NAME",
            "authentication": {
                "providerKey": "API_KEY_NAME",
            },
            "parameters": {
                "organizationId": "ORGANIZATION_ID",
                "projectId": "PROJECT_ID",
            },
          }
        },
        # If you want to store the original text
        # in addition to the generated embeddings
        # you must create a separate column.
        "TEXT_COLUMN_NAME": {"type": "text"},
    },
    # You should change the primary key definition to meet the needs of your data.
    "primaryKey": {
        "partitionBy": ["TEXT_COLUMN_NAME"],
        "partitionSort": {},
    },
}
# end::table-definition-dictionary-openai[]

# tag::table-definition-azure-openai[]

# Define the columns and primary key for the table
table_definition = CreateTableDefinition(
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
    # You should change the primary key definition to meet the needs of your data.
    primary_key=TablePrimaryKeyDescriptor(
        partition_by=["TEXT_COLUMN_NAME"],
        partition_sort={}
    ),
)
# end::table-definition-azure-openai[]

# tag::table-definition-fluent-azure-openai[]

# Define the columns and primary key for the table
table_definition = (
    CreateTableDefinition.builder()
    # This column will store vector embeddings.
    # The {embedding-provider-name} integration
    # will automatically generate vector embeddings
    # for any text inserted to this column.
    .add_vector_column("VECTOR_COLUMN_NAME",
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
    )
    # If you want to store the original text
    # in addition to the generated embeddings
    # you must create a separate column.
    .add_column("TEXT_COLUMN_NAME", ColumnType.TEXT)
    # You should change the primary key definition to meet the needs of your data.
    .add_partition_by(["TEXT_COLUMN_NAME"])
    # Finally, build the table definition.
    .build()
)
# end::table-definition-fluent-azure-openai[]

# tag::table-definition-dictionary-azure-openai[]

# Define the columns and primary key for the table
table_definition = {
    "columns": {
        # This column will store vector embeddings.
        # The {embedding-provider-name} integration
        # will automatically generate vector embeddings
        # for any text inserted to this column.
        "VECTOR_COLUMN_NAME": {
          "type": "vector",
          "dimension": MODEL_DIMENSIONS,
          "service": {
            "provider": "{embedding-provider-name-api}",
            "model_name": "MODEL_NAME",
            "authentication": {
                "providerKey": "API_KEY_NAME",
            },
            "parameters": {
                "resourceName": "RESOURCE_NAME",
                "deploymentId": "DEPLOYMENT_ID",
            },
          }
        },
        # If you want to store the original text
        # in addition to the generated embeddings
        # you must create a separate column.
        "TEXT_COLUMN_NAME": {"type": "text"},
    },
    # You should change the primary key definition to meet the needs of your data.
    "primaryKey": {
        "partitionBy": ["TEXT_COLUMN_NAME"],
        "partitionSort": {},
    },
}
# end::table-definition-dictionary-azure-openai[]

# tag::table-definition-hosted-provider[]

# Define the columns and primary key for the table
table_definition = CreateTableDefinition(
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
    # You should change the primary key definition to meet the needs of your data.
    primary_key=TablePrimaryKeyDescriptor(
        partition_by=["TEXT_COLUMN_NAME"],
        partition_sort={}
    ),
)
# end::table-definition-hosted-provider[]

# tag::table-definition-fluent-hosted-provider[]

# Define the columns and primary key for the table
table_definition = (
    CreateTableDefinition.builder()
    # This column will store vector embeddings.
    # The {embedding-provider-name} integration
    # will automatically generate vector embeddings
    # for any text inserted to this column.
    .add_vector_column("VECTOR_COLUMN_NAME",
        service=VectorServiceOptions(
            provider="{embedding-provider-name-api}",
            model_name="{embedding-provider-model-name-api}",
        ),
    )
    # If you want to store the original text
    # in addition to the generated embeddings
    # you must create a separate column.
    .add_column("TEXT_COLUMN_NAME", ColumnType.TEXT)
    # You should change the primary key definition to meet the needs of your data.
    .add_partition_by(["TEXT_COLUMN_NAME"])
    # Finally, build the table definition.
    .build()
)
# end::table-definition-fluent-hosted-provider[]

# tag::table-definition-dictionary-hosted-provider[]

# Define the columns and primary key for the table
table_definition = {
    "columns": {
        # This column will store vector embeddings.
        # The {embedding-provider-name} integration
        # will automatically generate vector embeddings
        # for any text inserted to this column.
        "VECTOR_COLUMN_NAME": {
          "type": "vector",
          "service": {
            "provider": "{embedding-provider-name-api}",
            "model_name": "{embedding-provider-model-name-api}",
          }
        },
        # If you want to store the original text
        # in addition to the generated embeddings
        # you must create a separate column.
        "TEXT_COLUMN_NAME": {"type": "text"},
    },
    # You should change the primary key definition to meet the needs of your data.
    "primaryKey": {
        "partitionBy": ["TEXT_COLUMN_NAME"],
        "partitionSort": {},
    },
}
# end::table-definition-dictionary-hosted-provider[]

# tag::create-table[]

# Create the table
table = database.create_table(
    "TABLE_NAME",
    definition=table_definition,
)
# end::create-table[]

# tag::index-columns[]

# Index the vector column so that you can perform a vector search on it.
table.create_vector_index(
    "INDEX_NAME",
    column="VECTOR_COLUMN_NAME",
    options=TableVectorIndexOptions(
        metric=VectorMetric.SIMILARITY_METRIC,
    ),
)
# end::index-columns[]

# tag::index-columns-hosted[]

# Index the vector column so that you can perform a vector search on it.
table.create_vector_index(
    "INDEX_NAME",
    column="VECTOR_COLUMN_NAME",
    options=TableVectorIndexOptions(
        metric=VectorMetric.COSINE,
    ),
)
# end::index-columns-hosted[]
