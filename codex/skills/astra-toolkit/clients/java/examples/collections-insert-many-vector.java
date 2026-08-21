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

    // Insert documents to the collection
    Document document1 =
        new Document()
            .append("name", "Jane Doe")
            .append("age", 42)
            .append("$vector", new float[] {0.08f, -0.62f, 0.39f});
    Document document2 =
        new Document()
            .append("nickname", "Bobby")
            .append("$vector", new float[] {0.12f, 0.53f, 0.32f});
    CollectionInsertManyResult result = collection.insertMany(List.of(document1, document2));
    System.out.println("IDs inserted: " + result.getInsertedIds());
  }
}
