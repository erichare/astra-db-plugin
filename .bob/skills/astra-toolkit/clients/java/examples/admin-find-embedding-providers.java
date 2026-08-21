import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.admin.DatabaseAdmin;
import com.datastax.astra.client.core.vectorize.EmbeddingProvider;
import com.datastax.astra.client.databases.Database;
import com.datastax.astra.client.databases.commands.results.FindEmbeddingProvidersResult;
import java.util.Map;

public class Example {
  public static void main(String[] args) {
    Database database = new DataAPIClient("**APPLICATION_TOKEN**").getDatabase("**API_ENDPOINT**");

    DatabaseAdmin databaseAdmin = database.getDatabaseAdmin();

    FindEmbeddingProvidersResult result = databaseAdmin.findEmbeddingProviders();

    Map<String, EmbeddingProvider> providers = result.getEmbeddingProviders();

    System.out.println(providers);
  }
}
