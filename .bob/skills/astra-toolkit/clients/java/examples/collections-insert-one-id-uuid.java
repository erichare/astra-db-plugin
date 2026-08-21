import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.collections.Collection;
import com.datastax.astra.client.collections.commands.results.CollectionInsertOneResult;
import com.datastax.astra.client.collections.definition.documents.Document;
import com.datastax.astra.client.collections.definition.documents.types.UUIDv7;

public class Example {

  public static void main(String[] args) {
    // Get an existing collection
    Collection<Document> collection =
        new DataAPIClient("**APPLICATION_TOKEN**")
            .getDatabase("**API_ENDPOINT**")
            .getCollection("**COLLECTION_NAME**");

    // Insert a document into the collection
    Document document = new Document().id(new UUIDv7()).append("name", "Jane Doe");
    CollectionInsertOneResult result = collection.insertOne(document);
    System.out.println(result.getInsertedId());
  }
}
