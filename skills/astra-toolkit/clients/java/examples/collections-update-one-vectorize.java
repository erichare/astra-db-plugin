import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.collections.Collection;
import com.datastax.astra.client.collections.commands.Update;
import com.datastax.astra.client.collections.commands.options.CollectionUpdateOneOptions;
import com.datastax.astra.client.collections.commands.results.CollectionUpdateResult;
import com.datastax.astra.client.collections.definition.documents.Document;
import com.datastax.astra.client.core.query.Sort;

public class Example {

  public static void main(String[] args) {
    // Get an existing collection
    Collection<Document> collection =
        new DataAPIClient("**APPLICATION_TOKEN**")
            .getDatabase("**API_ENDPOINT**")
            .getCollection("**COLLECTION_NAME**");

    // Update a document
    CollectionUpdateOneOptions options =
        new CollectionUpdateOneOptions().sort(Sort.vectorize("Text to vectorize"));

    Update update = Update.create().set("color", "blue");

    CollectionUpdateResult result = collection.updateOne(null, update, options);

    System.out.println(result.getMatchedCount());
    System.out.println(result.getModifiedCount());
  }
}
