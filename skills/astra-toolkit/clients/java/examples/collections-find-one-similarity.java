import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.collections.Collection;
import com.datastax.astra.client.collections.commands.options.CollectionFindOneOptions;
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

    // Find a document
    CollectionFindOneOptions options =
        new CollectionFindOneOptions()
            .sort(Sort.vectorize("Text to vectorize"))
            .includeSimilarity(true);

    Optional<Document> result = collection.findOne(options);

    if (result.isPresent()) {
      Document document = result.get();

      Double similarity = document.getDouble("$similarity");

      System.out.println(similarity);
    }
  }
}
