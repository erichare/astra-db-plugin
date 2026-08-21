import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.collections.Collection;
import com.datastax.astra.client.collections.commands.Update;
import com.datastax.astra.client.collections.commands.options.CollectionFindOneAndUpdateOptions;
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

    // Update a document
    Update update = Update.create().set("color", "blue");
    CollectionFindOneAndUpdateOptions options =
        new CollectionFindOneAndUpdateOptions()
            .sort(Sort.vector(new float[] {0.08f, -0.62f, 0.39f}));
    Optional<Document> result = collection.findOneAndUpdate(null, update, options);
    System.out.println(result);
  }
}
