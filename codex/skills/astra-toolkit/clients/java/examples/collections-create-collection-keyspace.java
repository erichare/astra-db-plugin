import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.collections.Collection;
import com.datastax.astra.client.collections.commands.options.CreateCollectionOptions;
import com.datastax.astra.client.collections.definition.documents.Document;
import com.datastax.astra.client.databases.Database;

public class Example {

  public static void main(String[] args) {
    // Get a database
    Database database = new DataAPIClient("**APPLICATION_TOKEN**").getDatabase("**API_ENDPOINT**");

    // Create a collection
    CreateCollectionOptions options = new CreateCollectionOptions().keyspace("**KEYSPACE_NAME**");
    Collection<Document> collection =
        database.createCollection("**COLLECTION_NAME**", null, options);
  }
}
