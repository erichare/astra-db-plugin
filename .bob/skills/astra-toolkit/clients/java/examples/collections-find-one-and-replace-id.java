import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.collections.Collection;
import com.datastax.astra.client.collections.definition.documents.Document;
import com.datastax.astra.client.core.query.Filter;
import com.datastax.astra.client.core.query.Filters;
import java.util.Optional;

public class Example {

  public static void main(String[] args) {
    // Get an existing collection
    Collection<Document> collection =
        new DataAPIClient("**APPLICATION_TOKEN**")
            .getDatabase("**API_ENDPOINT**")
            .getCollection("**COLLECTION_NAME**");

    // Replace a document
    Filter filter = Filters.eq("_id", "101");
    Document newDocument = new Document().append("name", "Jane Doe").append("age", 42);
    Optional<Document> result = collection.findOneAndReplace(filter, newDocument);
    System.out.println(result);
  }
}
