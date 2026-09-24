import com.datastax.astra.client.DataAPIClient;

public class Example {
  public static void main(String[] args) {
    DataAPIClient client = new DataAPIClient(System.getenv("ASTRA_DB_APPLICATION_TOKEN"));
  }
}
