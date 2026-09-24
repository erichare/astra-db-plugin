import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.admin.DatabaseAdmin;
import com.datastax.astra.client.databases.Database;

public class Example {

  public static void main(String[] args) {
    // Get a database
    Database database = new DataAPIClient(System.getenv("ASTRA_DB_APPLICATION_TOKEN")).getDatabase(System.getenv("ASTRA_DB_API_ENDPOINT"));

    // Get an admin object
    DatabaseAdmin admin = database.getDatabaseAdmin();

    // Drop a keyspace
    admin.dropKeyspace("**KEYSPACE_NAME**");
  }
}
