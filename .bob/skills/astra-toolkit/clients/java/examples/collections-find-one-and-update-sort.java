import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.collections.Collection;
import com.datastax.astra.client.collections.commands.Update;
import com.datastax.astra.client.collections.commands.options.CollectionFindOneAndUpdateOptions;
import com.datastax.astra.client.collections.definition.documents.Document;
import com.datastax.astra.client.core.query.Filter;
import com.datastax.astra.client.core.query.Filters;
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
    Filter filter = Filters.eq("metadata.language", "English");
    CollectionFindOneAndUpdateOptions options =
        new CollectionFindOneAndUpdateOptions()
            .sort(Sort.ascending("rating"), Sort.descending("title"));
    Update update = Update.create().set("color", "blue");
    Optional<Document> result = collection.findOneAndUpdate(filter, update, options);
    System.out.println(result);
  }
}
