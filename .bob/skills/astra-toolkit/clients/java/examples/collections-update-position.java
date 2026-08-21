import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.collections.Collection;
import com.datastax.astra.client.collections.commands.Update;
import com.datastax.astra.client.collections.commands.results.CollectionUpdateResult;
import com.datastax.astra.client.collections.definition.documents.Document;
import com.datastax.astra.client.core.query.Filter;
import com.datastax.astra.client.core.query.Filters;
import java.util.Arrays;

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
            Filters.eq("title", "Into Shadows of Tomorrow"), Filters.eq("author", "Nicole Wright"));

    Update update = Update.create().pushEach("genres", Arrays.asList("Mystery", "Fiction"), 3);

    CollectionUpdateResult result = collection.updateOne(filter, update);

    System.out.println(result.getMatchedCount());
    System.out.println(result.getModifiedCount());
  }
}
