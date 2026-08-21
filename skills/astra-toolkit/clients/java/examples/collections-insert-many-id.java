import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.collections.Collection;
import com.datastax.astra.client.collections.commands.results.CollectionInsertManyResult;
import com.datastax.astra.client.collections.definition.documents.Document;
import com.datastax.astra.client.collections.definition.documents.types.ObjectId;
import com.datastax.astra.client.collections.definition.documents.types.UUIDv7;
import java.util.List;
import java.util.UUID;

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
            .append("_id", new ObjectId("6672e1cbd7fabb4e5493916f"))
            .append("name", "Melissa");
    Document document2 = new Document().append("_id", new UUIDv7()).append("name", "Jess");
    Document document3 = new Document().append("_id", UUID.randomUUID()).append("name", "Sam");
    Document document4 = new Document().append("_id", 1).append("name", "Jane");
    Document document5 = new Document().append("_id", "b_023").append("name", "Bobby");
    CollectionInsertManyResult result =
        collection.insertMany(List.of(document1, document2, document3, document4, document5));
    System.out.println("IDs inserted: " + result.getInsertedIds());
  }
}
