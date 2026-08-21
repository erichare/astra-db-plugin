// tag::opening[]
import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.core.vector.SimilarityMetric;
import com.datastax.astra.client.core.vectorize.VectorServiceOptions;
import com.datastax.astra.client.tables.commands.AlterTableAddVectorize;
import com.datastax.astra.client.tables.definition.rows.Row;
import com.datastax.astra.client.tables.Table;

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
    // Configure an embedding provider for a column
    AlterTableAddVectorize alterOperation = new AlterTableAddVectorize()
        .columns(
            Map.of(
                "VECTOR_COLUMN_NAME",
                new VectorServiceOptions()
                    .provider("{embedding-provider-name-api}")
                    .modelName("MODEL_NAME")
                    .authentication(Map.of("providerKey", "API_KEY_NAME"))
            )
        );
// end::add-external-provider[]

// tag::add-hugging-face-dedicated[]
    // Define parameters for the embedding provider
    Map<String, Object > params = new HashMap<>();
    params.put("endpointName", "ENDPOINT_NAME");
    params.put("regionName", "REGION");
    params.put("cloudName", "CLOUD_PROVIDER");

    // Configure an embedding provider for a column
    AlterTableAddVectorize alterOperation = new AlterTableAddVectorize()
        .columns(
            Map.of(
                "VECTOR_COLUMN_NAME",
                new VectorServiceOptions()
                    .provider("{embedding-provider-name-api}")
                    .modelName("{embedding-provider-model-name-api}")
                    .authentication(Map.of("providerKey", "API_KEY_NAME"))
            )
        );
// end::add-hugging-face-dedicated[]

// tag::add-openai[]
    // Define parameters for the embedding provider
    Map<String, Object > params = new HashMap<>();
    params.put("organizationId", "ORGANIZATION_ID");
    params.put("projectId", "PROJECT_ID");

    // Configure an embedding provider for a column
    AlterTableAddVectorize alterOperation = new AlterTableAddVectorize()
        .columns(
            Map.of(
                "VECTOR_COLUMN_NAME",
                new VectorServiceOptions()
                    .provider("{embedding-provider-name-api}")
                    .modelName("MODEL_NAME")
                    .authentication(Map.of("providerKey", "API_KEY_NAME"))
                    .parameters(params)
            )
        );
// end::add-openai[]

// tag::add-azure-openai[]
    // Define parameters for the embedding provider
    Map<String, Object > params = new HashMap<>();
    params.put("resourceName", "RESOURCE_NAME");
    params.put("deploymentId", "DEPLOYMENT_ID");


    // Configure an embedding provider for a column
    AlterTableAddVectorize alterOperation = new AlterTableAddVectorize()
        .columns(
            Map.of(
                "VECTOR_COLUMN_NAME",
                new VectorServiceOptions()
                    .provider("{embedding-provider-name-api}")
                    .modelName("MODEL_NAME")
                    .authentication(Map.of("providerKey", "API_KEY_NAME"))
                    .parameters(params)
            )
        );
// end::add-azure-openai[]

// tag::add-hosted-provider[]
    // Configure an embedding provider for a column
    AlterTableAddVectorize alterOperation = new AlterTableAddVectorize()
        .columns(
            Map.of(
                "VECTOR_COLUMN_NAME",
                new VectorServiceOptions()
                    .provider("{embedding-provider-name-api}")
                    .modelName("{embedding-provider-model-name-api}")
            )
        );
// end::add-hosted-provider[]

//tag::closing[]

    table.alter(alterOperation);
  }
}
//end::closing[]
