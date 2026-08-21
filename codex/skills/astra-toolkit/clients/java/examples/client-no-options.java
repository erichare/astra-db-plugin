import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.core.options.DataAPIClientOptions;

public class Example {

  public static void main(String[] args) {
    DataAPIClient client = new DataAPIClient(new DataAPIClientOptions());
  }
}
