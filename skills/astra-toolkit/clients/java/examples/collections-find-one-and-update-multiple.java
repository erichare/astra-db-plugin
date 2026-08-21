import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.collections.Collection;
import com.datastax.astra.client.collections.commands.Update;
import com.datastax.astra.client.collections.definition.documents.Document;
import com.datastax.astra.client.core.query.Filter;
import com.datastax.astra.client.core.query.Filters;
import java.util.Arrays;
import java.util.Optional;

public class Example {

  public static void main(String[] args) {
    // Get an existing collection
    Collection<Document> collection =
        new DataAPIClient("**APPLICATION_TOKEN**")
            .getDatabase("**API_ENDPOINT**")
            .getCollection("**COLLECTION_NAME**");

    // Update a document
    Filter filter = Filters.eq("_id", "101");
    Update update =
        Update.create()
            .set("color", "blue")
            .set("classes", Arrays.asList("biology", "algebra", "swimming"))
            .unset("phone")
            .inc("age", 1.0);
    Optional<Document> result = collection.findOneAndUpdate(filter, update);
    System.out.println(result);
  }
}
