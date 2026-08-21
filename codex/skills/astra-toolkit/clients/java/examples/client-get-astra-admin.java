import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.admin.AstraDBAdmin;

public class Example {
  public static void main(String[] args) {
    // Get an admin object
    DataAPIClient client = new DataAPIClient("**APPLICATION_TOKEN**");
    AstraDBAdmin admin = client.getAdmin();
  }
}
