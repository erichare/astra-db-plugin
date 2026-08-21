// tag::opening[]
import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.core.vectorize.VectorServiceOptions;
import com.datastax.astra.client.tables.Table;
import com.datastax.astra.client.tables.definition.columns.TableColumnDefinitionVector;
import com.datastax.astra.client.tables.definition.rows.Row;
import com.datastax.astra.client.tables.commands.AlterTableAddColumns;

import java.util.HashMap;
import java.util.Map;

public class Example {

  public static void main(String[] args) {
    // Get an existing table
    Table<Row> table =
        new DataAPIClient("APPLICATION_TOKEN")
            .getDatabase("API_ENDPOINT")
            .getTable("TABLE_NAME");

// end::opening[]

// tag::add-external-provider[]
    // Add a vector column and configure an embedding provider
    AlterTableAddColumns alterOperation = new AlterTableAddColumns()
        // This column will store vector embeddings.
        // The {embedding-provider-name} integration
        // will automatically generate vector embeddings
        // for any text inserted to this column.
        .addColumnVector(
            "VECTOR_COLUMN_NAME",
            new TableColumnDefinitionVector()
                .dimension(MODEL_DIMENSIONS)
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
        .addColumnText("TEXT_COLUMN_NAME");
// end::add-external-provider[]

// tag::add-hugging-face-dedicated[]
    // Define parameters for the embedding provider
    Map<String, Object > params = new HashMap<>();
    params.put("endpointName", "ENDPOINT_NAME");
    params.put("regionName", "REGION");
    params.put("cloudName", "CLOUD_PROVIDER");

    // Add a vector column and configure an embedding provider
    AlterTableAddColumns alterOperation = new AlterTableAddColumns()
        // This column will store vector embeddings.
        // The {embedding-provider-name} integration
        // will automatically generate vector embeddings
        // for any text inserted to this column.
        .addColumnVector(
            "VECTOR_COLUMN_NAME",
            new TableColumnDefinitionVector()
                .dimension(MODEL_DIMENSIONS)
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
        .addColumnText("TEXT_COLUMN_NAME");
// end::add-hugging-face-dedicated[]

// tag::add-openai[]
    // Define parameters for the embedding provider
    Map<String, Object > params = new HashMap<>();
    params.put("organizationId", "ORGANIZATION_ID");
    params.put("projectId", "PROJECT_ID");

    // Add a vector column and configure an embedding provider
    AlterTableAddColumns alterOperation = new AlterTableAddColumns()
        // This column will store vector embeddings.
        // The {embedding-provider-name} integration
        // will automatically generate vector embeddings
        // for any text inserted to this column.
        .addColumnVector(
            "VECTOR_COLUMN_NAME",
            new TableColumnDefinitionVector()
                .dimension(MODEL_DIMENSIONS)
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
        .addColumnText("TEXT_COLUMN_NAME");
// end::add-openai[]

// tag::add-azure-openai[]
    // Define parameters for the embedding provider
    Map<String, Object > params = new HashMap<>();
    params.put("resourceName", "RESOURCE_NAME");
    params.put("deploymentId", "DEPLOYMENT_ID");

    // Add a vector column and configure an embedding provider
    AlterTableAddColumns alterOperation = new AlterTableAddColumns()
        // This column will store vector embeddings.
        // The {embedding-provider-name} integration
        // will automatically generate vector embeddings
        // for any text inserted to this column.
        .addColumnVector(
            "VECTOR_COLUMN_NAME",
            new TableColumnDefinitionVector()
                .dimension(MODEL_DIMENSIONS)
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
        .addColumnText("TEXT_COLUMN_NAME");
// end::add-azure-openai[]

// tag::add-hosted-provider[]
    // Add a vector column and configure an embedding provider
    AlterTableAddColumns alterOperation = new AlterTableAddColumns()
        // This column will store vector embeddings.
        // The {embedding-provider-name} integration
        // will automatically generate vector embeddings
        // for any text inserted to this column.
        .addColumnVector(
            "VECTOR_COLUMN_NAME",
            new TableColumnDefinitionVector()
                .service(
                    new VectorServiceOptions()
                        .provider("{embedding-provider-name-api}")
                        .modelName("{embedding-provider-model-name-api}")
                )
        )
        // If you want to store the original text
        // in addition to the generated embeddings
        // you must create a separate column.
        .addColumnText("TEXT_COLUMN_NAME");
// end::add-hosted-provider[]

//tag::closing[]

    table.alter(alterOperation);
  }
}
//end::closing[]
