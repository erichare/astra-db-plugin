import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.collections.Collection;
import com.datastax.astra.client.collections.commands.results.CollectionInsertManyResult;
import com.datastax.astra.client.collections.definition.documents.Document;
import java.util.List;

public class Example {

  public static void main(String[] args) {
    // Get an existing collection
    Collection<Document> collection =
        new DataAPIClient("**APPLICATION_TOKEN**")
            .getDatabase("**API_ENDPOINT**")
            .getCollection("**COLLECTION_NAME**");

    // Insert documents into the collection
    Document document1 =
        new Document()
            .append("name", "Jane Doe")
            .append("age", 42)
            .append("$vectorize", "Text to vectorize for this document");
    Document document2 =
        new Document()
            .append("nickname", "Bobby")
            .append("$vectorize", "Text to vectorize for this document");
    CollectionInsertManyResult result = collection.insertMany(List.of(document1, document2));
    System.out.println("IDs inserted: " + result.getInsertedIds());
  }
}
