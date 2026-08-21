import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.databases.Database;
import com.datastax.astra.client.tables.definition.TableDescriptor;
import java.util.List;

public class Example {

  public static void main(String[] args) {
    // Get a database
    Database database = new DataAPIClient("**APPLICATION_TOKEN**").getDatabase("**API_ENDPOINT**");

    // List table metadata
    List<TableDescriptor> result = database.listTables();

    System.out.println(result);
  }
}
