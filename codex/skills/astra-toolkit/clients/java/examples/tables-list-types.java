import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.databases.Database;
import com.datastax.astra.client.tables.definition.types.TableUserDefinedTypeDescriptor;
import java.util.List;

public class Example {

  public static void main(String[] args) {
    // Get a database
    Database database = new DataAPIClient("**APPLICATION_TOKEN**").getDatabase("**API_ENDPOINT**");

    // List type metadata
    List<TableUserDefinedTypeDescriptor> result = database.listTypes();

    System.out.println(result);
  }
}
