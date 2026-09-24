import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.databases.Database;
import com.datastax.astra.client.tables.commands.options.ListTablesOptions;
import java.util.List;

public class Example {

  public static void main(String[] args) {
    // Get a database
    Database database = new DataAPIClient(System.getenv("ASTRA_DB_APPLICATION_TOKEN")).getDatabase(System.getenv("ASTRA_DB_API_ENDPOINT"));

    // List table names
    ListTablesOptions options = new ListTablesOptions().keyspace("**KEYSPACE_NAME**");
    List<String> result = database.listTableNames(options);

    System.out.println(result);
  }
}
