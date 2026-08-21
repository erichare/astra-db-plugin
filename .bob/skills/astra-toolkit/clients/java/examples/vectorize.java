// tag::pre-collection-definition[]
import com.datastax.astra.client.collections.Collection;
import com.datastax.astra.client.collections.definition.CollectionDefinition;
import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.databases.Database;
import com.datastax.astra.client.collections.definition.documents.Document;
import com.datastax.astra.client.core.vector.SimilarityMetric;


public class Example {

  public static void main(String[] args) {
    // Instantiate the client
    DataAPIClient client = new DataAPIClient(new DataAPIClientOptions());

    // Connect to a database
    Database database =
        client.getDatabase(
            "API_ENDPOINT",
            new DatabaseOptions("APPLICATION_TOKEN", new DataAPIClientOptions()));
// end::pre-collection-definition[]

// tag::collection-definition-external-provider[]

    // Define the collection
    CollectionDefinition collectionDefinition =
        new CollectionDefinition()
            .vectorDimension(MODEL_DIMENSIONS)
            .vectorSimilarity(SimilarityMetric.SIMILARITY_METRIC)
            .vectorize(
                "{embedding-provider-name-api}",
                "MODEL_NAME",
                "API_KEY_NAME");
// end::collection-definition-external-provider[]

// tag::collection-definition-hugging-face-dedicated[]

    // Define parameters for the service provider
    Map<String, Object> parameters = new HashMap<>();
    parameters.put("endpointName", "ENDPOINT_NAME");
    parameters.put("regionName", "REGION");
    parameters.put("cloudName", "CLOUD_PROVIDER");

    // Define the collection
    CollectionDefinition collectionDefinition =
    new CollectionDefinition()
        .vectorDimension(MODEL_DIMENSIONS)
        .vectorSimilarity(SimilarityMetric.SIMILARITY_METRIC)
        .vectorize(
            "{embedding-provider-name-api}",
            "{embedding-provider-model-name-api}",
            "API_KEY_NAME",
            parameters);
// end::collection-definition-hugging-face-dedicated[]

// tag::collection-definition-openai[]

    // Define parameters for the service provider
    Map<String, Object> parameters = new HashMap<>();
    parameters.put("organizationId", "ORGANIZATION_ID");
    parameters.put("projectId", "PROJECT_ID");

    // Define the collection
    CollectionDefinition collectionDefinition =
    new CollectionDefinition()
        .vectorDimension(MODEL_DIMENSIONS)
        .vectorSimilarity(SimilarityMetric.SIMILARITY_METRIC)
        .vectorize(
            "{embedding-provider-name-api}",
            "MODEL_NAME",
            "API_KEY_NAME",
            parameters);
// end::collection-definition-openai[]

// tag::collection-definition-azure-openai[]

    // Define parameters for the service provider
    Map<String, Object> parameters = new HashMap<>();
    parameters.put("resourceName", "RESOURCE_NAME");
    parameters.put("deploymentId", "DEPLOYMENT_ID");

    // Define the collection
    CollectionDefinition collectionDefinition =
    new CollectionDefinition()
        .vectorDimension(MODEL_DIMENSIONS)
        .vectorSimilarity(SimilarityMetric.SIMILARITY_METRIC)
        .vectorize(
            "{embedding-provider-name-api}",
            "MODEL_NAME",
            "API_KEY_NAME",
            parameters);
// end::collection-definition-azure-openai[]

// tag::collection-definition-hosted-provider[]

    // Define the collection
    CollectionDefinition collectionDefinition =
        new CollectionDefinition()
            .vectorSimilarity(SimilarityMetric.COSINE)
            .vectorize(
                "{embedding-provider-name-api}",
                "{embedding-provider-model-name-api}");
// end::collection-definition-hosted-provider[]

// tag::post-collection-definition[]

    // Create the collection
    Collection<Document> collection = database.createCollection("COLLECTION_NAME", collectionDefinition);
  }
}
// end::post-collection-definition[]
