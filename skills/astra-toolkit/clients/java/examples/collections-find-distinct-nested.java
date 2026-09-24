import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.collections.Collection;
import com.datastax.astra.client.collections.definition.documents.Document;
import java.util.Set;

public class Example {

  public static void main(String[] args) {
    // Get an existing collection
    Collection<Document> collection =
        new DataAPIClient(System.getenv("ASTRA_DB_APPLICATION_TOKEN"))
            .getDatabase(System.getenv("ASTRA_DB_API_ENDPOINT"))
            .getCollection("**COLLECTION_NAME**");

    // Find distinct values
    Set<String> result = collection.distinct("metadata.language", String.class);

    System.out.println(result);
  }
}
