import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.collections.Collection;
import com.datastax.astra.client.collections.definition.documents.Document;

public class Example {

  public static void main(String[] args) {
    // Get an existing collection
    Collection<Document> collection =
        new DataAPIClient("**APPLICATION_TOKEN**")
            .getDatabase("**API_ENDPOINT**")
            .getCollection("**COLLECTION_NAME**");

    Document document1 =
        new Document()
            .append("name", "Jane Doe")
            .append("$lexical", "An author who writes SciFi and fantasy novels.");
    Document document2 =
        new Document()
            .append("name", "Mary Day")
            .append("$lexical", "An active hiker, runner, and triathlete who loves the outdoors.");

    collection.insertMany(document1, document2);
  }
}
