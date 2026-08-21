import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.collections.Collection;
import com.datastax.astra.client.collections.commands.Update;
import com.datastax.astra.client.collections.commands.options.CollectionUpdateOneOptions;
import com.datastax.astra.client.collections.commands.results.CollectionUpdateResult;
import com.datastax.astra.client.collections.definition.documents.Document;
import com.datastax.astra.client.core.query.Filter;
import com.datastax.astra.client.core.query.Filters;
import java.util.Map;

public class Example {

  public static void main(String[] args) {
    // Get an existing collection
    Collection<Document> collection =
        new DataAPIClient("**APPLICATION_TOKEN**")
            .getDatabase("**API_ENDPOINT**")
            .getCollection("**COLLECTION_NAME**");

    // Update a document
    Filter filter =
        Filters.and(
            Filters.eq("title", "Name of the Mountain"), Filters.eq("author", "Gina Marlin"));

    Update update = Update.create().setOnInsert(Map.of("rating", 5.0, "is_checked_out", false));

    CollectionUpdateOneOptions options = new CollectionUpdateOneOptions().upsert(true);

    CollectionUpdateResult result = collection.updateOne(filter, update, options);

    System.out.println(result.getMatchedCount());
    System.out.println(result.getModifiedCount());
    System.out.println(result.getUpsertedId());
  }
}
