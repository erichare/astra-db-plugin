import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.databases.Database;
import java.util.List;

public class Example {

  public static void main(String[] args) {
    // Get a database
    Database database = new DataAPIClient("**APPLICATION_TOKEN**").getDatabase("**API_ENDPOINT**");

    // List table names
    List<String> result = database.listTableNames();

    System.out.println(result);
  }
}
