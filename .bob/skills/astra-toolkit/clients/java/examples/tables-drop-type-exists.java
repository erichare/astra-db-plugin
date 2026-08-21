import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.databases.Database;
import com.datastax.astra.client.tables.commands.options.DropTypeOptions;

public class Example {

  public static void main(String[] args) {
    // Get a database
    Database database = new DataAPIClient("**APPLICATION_TOKEN**").getDatabase("**API_ENDPOINT**");

    // Drop a user-defined type
    DropTypeOptions options = new DropTypeOptions().ifExists(true);
    database.dropType("**UDT_NAME**", options);
  }
}
