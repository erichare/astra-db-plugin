import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.collections.Collection;
import com.datastax.astra.client.collections.commands.options.CollectionFindOneAndReplaceOptions;
import com.datastax.astra.client.collections.definition.documents.Document;
import com.datastax.astra.client.core.query.Sort;
import java.util.Optional;

public class Example {

  public static void main(String[] args) {
    // Get an existing collection
    Collection<Document> collection =
        new DataAPIClient("**APPLICATION_TOKEN**")
            .getDatabase("**API_ENDPOINT**")
            .getCollection("**COLLECTION_NAME**");

    // Replace a document
    Document newDocument = new Document().append("name", "Jane Doe").append("age", 42);
    CollectionFindOneAndReplaceOptions options =
        new CollectionFindOneAndReplaceOptions().sort(Sort.vectorize("Text to vectorize"));
    Optional<Document> result = collection.findOneAndReplace(null, newDocument, options);
    System.out.println(result);
  }
}
