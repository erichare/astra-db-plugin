import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.collections.definition.CollectionDescriptor;
import com.datastax.astra.client.databases.Database;
import java.util.List;

public class Example {

  public static void main(String[] args) {
    // Get a database
    Database database = new DataAPIClient(System.getenv("ASTRA_DB_APPLICATION_TOKEN")).getDatabase(System.getenv("ASTRA_DB_API_ENDPOINT"));

    // List collections
    List<CollectionDescriptor> collectionMetadata = database.listCollections();
    collectionMetadata.stream().map(CollectionDescriptor::getOptions).forEach(System.out::println);
  }
}
