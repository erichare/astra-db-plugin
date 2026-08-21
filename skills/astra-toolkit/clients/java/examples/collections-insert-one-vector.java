import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.collections.Collection;
import com.datastax.astra.client.collections.commands.results.CollectionInsertOneResult;
import com.datastax.astra.client.collections.definition.documents.Document;

public class Example {

  public static void main(String[] args) {
    // Get an existing collection
    Collection<Document> collection =
        new DataAPIClient("**APPLICATION_TOKEN**")
            .getDatabase("**API_ENDPOINT**")
            .getCollection("**COLLECTION_NAME**");

    // Insert a document into the collection
    Document document =
        new Document()
            .append("name", "Jane Doe")
            .append("$vector", new float[] {0.08f, -0.62f, 0.39f});
    CollectionInsertOneResult result = collection.insertOne(document);
    System.out.println(result.getInsertedId());
  }
}
