import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.databases.Database;
import com.datastax.astra.client.tables.commands.options.DropTableOptions;

public class Example {

  public static void main(String[] args) {
    // Get a database
    Database database = new DataAPIClient("**APPLICATION_TOKEN**").getDatabase("**API_ENDPOINT**");

    // Drop a table
    DropTableOptions options = new DropTableOptions().ifExists(true);
    database.dropTable("**TABLE_NAME**", options);
  }
}
