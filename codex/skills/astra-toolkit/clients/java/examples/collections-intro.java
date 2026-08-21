import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.collections.Collection;
import com.datastax.astra.client.collections.commands.options.CollectionFindOneOptions;
import com.datastax.astra.client.collections.definition.documents.Document;
import com.datastax.astra.client.core.options.DataAPIClientOptions;
import com.datastax.astra.client.core.query.Filter;
import com.datastax.astra.client.core.query.Filters;
import com.datastax.astra.client.core.query.Sort;
import com.datastax.astra.client.databases.Database;
import com.datastax.astra.client.databases.DatabaseOptions;
import java.util.Optional;

public class Example {

  public static void main(String[] args) {
    // Instantiate the client
    DataAPIClient client = new DataAPIClient(new DataAPIClientOptions());

    // Connect to a database
    Database database =
        client.getDatabase(
            "**API_ENDPOINT**",
            new DatabaseOptions("**APPLICATION_TOKEN**", new DataAPIClientOptions()));

    // Get an existing collection
    Collection<Document> collection = database.getCollection("**COLLECTION_NAME**");

    // Use vector search and filters to find a document
    Filter filter =
        Filters.and(Filters.eq("is_checked_out", false), Filters.lt("number_of_pages", 300));
    CollectionFindOneOptions options =
        new CollectionFindOneOptions()
            .sort(Sort.vectorize("A thrilling story set in a futuristic world"));
    Optional<Document> result = collection.findOne(filter, options);
    System.out.println(result);
  }
}
