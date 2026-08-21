// tag::pre-table-definition[]
import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.core.vector.SimilarityMetric;
import com.datastax.astra.client.core.vectorize.VectorServiceOptions;
import com.datastax.astra.client.databases.Database;
import com.datastax.astra.client.tables.Table;
import com.datastax.astra.client.tables.definition.TableDefinition;
import com.datastax.astra.client.tables.definition.columns.ColumnDefinitionVector;
import com.datastax.astra.client.tables.definition.indexes.TableVectorIndexDefinition;
import com.datastax.astra.client.tables.definition.rows.Row;

import java.util.HashMap;
import java.util.Map;

public class Example {

  public static void main(String[] args) {
    // Instantiate the client
    DataAPIClient client = new DataAPIClient(new DataAPIClientOptions());

    // Connect to a database
    Database database =
        client.getDatabase(
            "API_ENDPOINT",
            new DatabaseOptions("APPLICATION_TOKEN", new DataAPIClientOptions()));
// end::pre-table-definition[]

// tag::table-definition-external-provider[]

    // Define the columns and primary key for the table
    TableDefinition tableDefinition =
        new TableDefinition()
            // This column will store vector embeddings.
            // The {embedding-provider-name} integration
            // will automatically generate vector embeddings
            // for any text inserted to this column.
            .addColumnVector(
                "VECTOR_COLUMN_NAME",
                new ColumnDefinitionVector()
                    .dimension(MODEL_DIMENSIONS)
                    .metric(SimilarityMetric.SIMILARITY_METRIC)
                    .service(
                        new VectorServiceOptions()
                            .provider("{embedding-provider-name-api}")
                            .modelName("MODEL_NAME")
                            .authentication(Map.of("providerKey", "API_KEY_NAME"))
                    )
            )
            // If you want to store the original text
            // in addition to the generated embeddings
            // you must create a separate column.
            .addColumnText("TEXT_COLUMN_NAME")
            // You should change the primary key definition to meet the needs of your data.
            .addPartitionBy("TEXT_COLUMN_NAME");
// end::table-definition-external-provider[]

// tag::table-definition-hugging-face-dedicated[]

    // Define parameters for the service provider
    Map<String, Object > params = new HashMap<>();
    params.put("endpointName", "ENDPOINT_NAME");
    params.put("regionName", "REGION");
    params.put("cloudName", "CLOUD_PROVIDER");

    // Define the columns and primary key for the table
    TableDefinition tableDefinition =
        new TableDefinition()
            // This column will store vector embeddings.
            // The {embedding-provider-name} integration
            // will automatically generate vector embeddings
            // for any text inserted to this column.
            .addColumnVector(
                "VECTOR_COLUMN_NAME",
                new ColumnDefinitionVector()
                    .dimension(MODEL_DIMENSIONS)
                    .metric(SimilarityMetric.SIMILARITY_METRIC)
                    .service(
                        new VectorServiceOptions()
                            .provider("{embedding-provider-name-api}")
                            .modelName("{embedding-provider-model-name-api}")
                            .authentication(Map.of("providerKey", "API_KEY_NAME"))
                    )
            )
            // If you want to store the original text
            // in addition to the generated embeddings
            // you must create a separate column.
            .addColumnText("TEXT_COLUMN_NAME")
            // You should change the primary key definition to meet the needs of your data.
            .addPartitionBy("TEXT_COLUMN_NAME");
// end::table-definition-hugging-face-dedicated[]

// tag::table-definition-openai[]

    // Define parameters for the service provider
    Map<String, Object > params = new HashMap<>();
    params.put("organizationId", "ORGANIZATION_ID");
    params.put("projectId", "PROJECT_ID");

    // Define the columns and primary key for the table
    TableDefinition tableDefinition =
        new TableDefinition()
            // This column will store vector embeddings.
            // The {embedding-provider-name} integration
            // will automatically generate vector embeddings
            // for any text inserted to this column.
            .addColumnVector(
                "VECTOR_COLUMN_NAME",
                new ColumnDefinitionVector()
                    .dimension(MODEL_DIMENSIONS)
                    .metric(SimilarityMetric.SIMILARITY_METRIC)
                    .service(
                        new VectorServiceOptions()
                            .provider("{embedding-provider-name-api}")
                            .modelName("MODEL_NAME")
                            .authentication(Map.of("providerKey", "API_KEY_NAME"))
                            .parameters(params)
                    )
            )
            // If you want to store the original text
            // in addition to the generated embeddings
            // you must create a separate column.
            .addColumnText("TEXT_COLUMN_NAME")
            // You should change the primary key definition to meet the needs of your data.
            .addPartitionBy("TEXT_COLUMN_NAME");
// end::table-definition-openai[]

// tag::table-definition-azure-openai[]
    // Define parameters for the service provider
    Map<String, Object > params = new HashMap<>();
    params.put("resourceName", "RESOURCE_NAME");
    params.put("deploymentId", "DEPLOYMENT_ID");


    // Define the columns and primary key for the table
    TableDefinition tableDefinition =
        new TableDefinition()
            // This column will store vector embeddings.
            // The {embedding-provider-name} integration
            // will automatically generate vector embeddings
            // for any text inserted to this column.
            .addColumnVector(
                "VECTOR_COLUMN_NAME",
                new ColumnDefinitionVector()
                    .dimension(MODEL_DIMENSIONS)
                    .metric(SimilarityMetric.SIMILARITY_METRIC)
                    .service(
                        new VectorServiceOptions()
                            .provider("{embedding-provider-name-api}")
                            .modelName("MODEL_NAME")
                            .authentication(Map.of("providerKey", "API_KEY_NAME"))
                            .parameters(params)
                    )
            )
            // If you want to store the original text
            // in addition to the generated embeddings
            // you must create a separate column.
            .addColumnText("TEXT_COLUMN_NAME")
            // You should change the primary key definition to meet the needs of your data.
            .addPartitionBy("TEXT_COLUMN_NAME");
// end::table-definition-azure-openai[]

// tag::table-definition-hosted-provider[]
    // Define the columns and primary key for the table
    TableDefinition tableDefinition =
        new TableDefinition()
            // This column will store vector embeddings.
            // The {embedding-provider-name} integration
            // will automatically generate vector embeddings
            // for any text inserted to this column.
            .addColumnVector(
                "VECTOR_COLUMN_NAME",
                new ColumnDefinitionVector()
                    .metric(SimilarityMetric.COSINE)
                    .service(
                        new VectorServiceOptions()
                            .provider("{embedding-provider-name-api}")
                            .modelName("{embedding-provider-model-name-api}")
                    )
            )
            // If you want to store the original text
            // in addition to the generated embeddings
            // you must create a separate column.
            .addColumnText("TEXT_COLUMN_NAME")
            // You should change the primary key definition to meet the needs of your data.
            .addPartitionBy("TEXT_COLUMN_NAME");
// end::table-definition-hosted-provider[]

// tag::create-table[]

    // Create the table
    Table<Row> table = database.createTable("TABLE_NAME", tableDefinition);
// end::create-table[]

//tag::index-columns-external[]

    // Index the vector column so that you can perform a vector search on it.
    TableVectorIndexDefinition definition =
        new TableVectorIndexDefinition().column("VECTOR_COLUMN_NAME").metric(SimilarityMetric.SIMILARITY_METRIC);

    table.createVectorIndex("INDEX_NAME", definition);
//end::index-columns-external[]

//tag::index-columns-hosted[]

    // Index the vector column so that you can perform a vector search on it.
    TableVectorIndexDefinition definition =
        new TableVectorIndexDefinition().column("VECTOR_COLUMN_NAME").metric(SimilarityMetric.COSINE);

    table.createVectorIndex("INDEX_NAME", definition);
//end::index-columns-hosted[]

//tag::closing[]
  }
}
//end::closing[]
