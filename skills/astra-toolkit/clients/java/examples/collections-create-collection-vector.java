import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.collections.Collection;
import com.datastax.astra.client.collections.definition.CollectionDefinition;
import com.datastax.astra.client.collections.definition.documents.Document;
import com.datastax.astra.client.core.vector.SimilarityMetric;
import com.datastax.astra.client.databases.Database;

public class Example {

  public static void main(String[] args) {
    // Get a database
    Database database = new DataAPIClient(System.getenv("ASTRA_DB_APPLICATION_TOKEN")).getDatabase(System.getenv("ASTRA_DB_API_ENDPOINT"));

    // Create a collection
    CollectionDefinition collectionDefinition =
        new CollectionDefinition().vectorDimension(1024).vectorSimilarity(SimilarityMetric.COSINE);

    Collection<Document> collection =
        database.createCollection("**COLLECTION_NAME**", collectionDefinition);
  }
}
