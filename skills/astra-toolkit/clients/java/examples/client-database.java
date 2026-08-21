import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.core.options.DataAPIClientOptions;
import com.datastax.astra.client.databases.Database;
import com.datastax.astra.client.databases.DatabaseOptions;

public class Example {
  public static void main(String[] args) {
    DataAPIClient client = new DataAPIClient(new DataAPIClientOptions());

    Database database =
        client.getDatabase(
            "**API_ENDPOINT**",
            new DatabaseOptions("**APPLICATION_TOKEN**", new DataAPIClientOptions()));
  }
}
