import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.collections.Collection;
import com.datastax.astra.client.collections.definition.documents.Document;
import com.datastax.astra.client.collections.exceptions.TooManyDocumentsToCountException;

public class Example {
  public static void main(String[] args) {
    // Get an existing collection
    Collection<Document> collection =
        new DataAPIClient("**APPLICATION_TOKEN**")
            .getDatabase("**API_ENDPOINT**")
            .getCollection("**COLLECTION_NAME**");

    // Count documents
    try {
      Integer result = collection.countDocuments(500);
      System.out.println(result);
    } catch (TooManyDocumentsToCountException error) {
      System.out.println("Number of documents exceeds upper bound or API limit");
    }
  }
}
