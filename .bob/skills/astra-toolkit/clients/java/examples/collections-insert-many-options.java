import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.collections.Collection;
import com.datastax.astra.client.collections.commands.options.CollectionInsertManyOptions;
import com.datastax.astra.client.collections.commands.results.CollectionInsertManyResult;
import com.datastax.astra.client.collections.definition.documents.Document;
import java.util.Arrays;
import java.util.List;

public class Example {

  public static void main(String[] args) {
    // Get an existing collection
    Collection<Document> collection =
        new DataAPIClient("**APPLICATION_TOKEN**")
            .getDatabase("**API_ENDPOINT**")
            .getCollection("**COLLECTION_NAME**");

    // Define the insertion options
    CollectionInsertManyOptions options =
        new CollectionInsertManyOptions().chunkSize(20).concurrency(3).ordered(false).timeout(1000);

    // Insert documents into the collection
    Document document1 = new Document().append("name", "Jane Doe").append("age", 42);
    Document document2 =
        new Document()
            .append("nickname", "Bobby")
            .append("color", "blue")
            .append("foods", Arrays.asList("carrots", "chocolate"));
    CollectionInsertManyResult result =
        collection.insertMany(List.of(document1, document2), options);
    System.out.println("IDs inserted: " + result.getInsertedIds());
  }
}
