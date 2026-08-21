import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.databases.Database;

public class Example {

  public static void main(String[] args) {
    // Get a database
    Database database = new DataAPIClient("**APPLICATION_TOKEN**").getDatabase("**API_ENDPOINT**");

    // Drop an index
    database.dropTableIndex("**INDEX_NAME**");
  }
}
