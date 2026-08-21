import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.admin.DatabaseAdmin;
import com.datastax.astra.client.databases.Database;

public class Example {

  public static void main(String[] args) {
    // Get a database object
    Database database = new DataAPIClient("**APPLICATION_TOKEN**").getDatabase("**API_ENDPOINT**");

    // Get a database admin object
    DatabaseAdmin databaseAdmin = database.getDatabaseAdmin();
  }
}
