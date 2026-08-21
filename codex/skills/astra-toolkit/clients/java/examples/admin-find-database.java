import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.admin.AstraDBAdmin;
import com.datastax.astra.client.databases.definition.DatabaseInfo;
import java.util.UUID;

public class Example {
  public static void main(String[] args) {
    DataAPIClient client = new DataAPIClient("**APPLICATION_TOKEN**");

    AstraDBAdmin admin = client.getAdmin();

    DatabaseInfo databaseInfo = admin.getDatabaseInfo(UUID.fromString("**DATABASE_ID**"));

    System.out.println(databaseInfo);
  }
}
