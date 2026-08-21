import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.admin.AstraDBAdmin;
import java.util.UUID;

public class Example {
  public static void main(String[] args) {
    DataAPIClient client = new DataAPIClient("**APPLICATION_TOKEN**");

    AstraDBAdmin admin = client.getAdmin();

    admin.dropDatabase(UUID.fromString("**DATABASE_ID**"));
  }
}
