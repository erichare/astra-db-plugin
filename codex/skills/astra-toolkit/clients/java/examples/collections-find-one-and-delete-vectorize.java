import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.collections.Collection;
import com.datastax.astra.client.collections.commands.options.CollectionFindOneAndDeleteOptions;
import com.datastax.astra.client.collections.definition.documents.Document;
import com.datastax.astra.client.core.query.Filter;
import com.datastax.astra.client.core.query.Sort;
import java.util.Optional;

public class Example {

  public static void main(String[] args) {
    // Get an existing collection
    Collection<Document> collection =
        new DataAPIClient("**APPLICATION_TOKEN**")
            .getDatabase("**API_ENDPOINT**")
            .getCollection("**COLLECTION_NAME**");

    // Delete a document
    Filter filter = new Filter();
    CollectionFindOneAndDeleteOptions options =
        new CollectionFindOneAndDeleteOptions().sort(Sort.vectorize("Text to vectorize"));
    Optional<Document> result = collection.findOneAndDelete(filter, options);
    System.out.println(result);
  }
}
