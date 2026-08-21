import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.admin.AstraDBAdmin;
import com.datastax.astra.client.admin.AstraDBDatabaseAdmin;

public class Example {
  public static void main(String[] args) {
    // Get an admin object
    DataAPIClient client = new DataAPIClient("**APPLICATION_TOKEN**");
    AstraDBAdmin admin = client.getAdmin();

    // Get a database admin object
    AstraDBDatabaseAdmin databaseAdmin = admin.getDatabaseAdmin("**API_ENDPOINT**");
  }
}
