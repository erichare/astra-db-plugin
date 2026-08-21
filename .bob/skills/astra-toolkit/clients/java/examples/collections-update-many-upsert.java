import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.collections.Collection;
import com.datastax.astra.client.collections.commands.Update;
import com.datastax.astra.client.collections.commands.options.CollectionUpdateManyOptions;
import com.datastax.astra.client.collections.commands.results.CollectionUpdateResult;
import com.datastax.astra.client.collections.definition.documents.Document;
import com.datastax.astra.client.core.query.Filter;
import com.datastax.astra.client.core.query.Filters;

public class Example {

  public static void main(String[] args) {
    // Get an existing collection
    Collection<Document> collection =
        new DataAPIClient("**APPLICATION_TOKEN**")
            .getDatabase("**API_ENDPOINT**")
            .getCollection("**COLLECTION_NAME**");

    // Update documents
    Filter filter =
        Filters.and(Filters.eq("is_checked_out", false), Filters.lt("number_of_pages", 300));
    Update update = Update.create().set("color", "blue");
    CollectionUpdateManyOptions options = new CollectionUpdateManyOptions().upsert(true);
    CollectionUpdateResult result = collection.updateMany(filter, update, options);
    System.out.println(result.getMatchedCount());
    System.out.println(result.getModifiedCount());
    System.out.println(result.getUpsertedId());
  }
}
