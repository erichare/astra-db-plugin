import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.admin.AstraDBAdmin;
import com.datastax.astra.client.databases.definition.DatabaseInfo;
import java.util.List;

public class Example {
  public static void main(String[] args) {
    DataAPIClient client = new DataAPIClient("**APPLICATION_TOKEN**");

    AstraDBAdmin admin = client.getAdmin();

    List<DatabaseInfo> databases = admin.listDatabases();

    System.out.println(databases);
  }
}
