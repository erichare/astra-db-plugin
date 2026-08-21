import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.admin.DatabaseAdmin;
import com.datastax.astra.client.core.rerank.RerankProvider;
import com.datastax.astra.client.databases.Database;
import com.datastax.astra.client.databases.commands.results.FindRerankingProvidersResult;
import java.util.Map;

public class Example {
  public static void main(String[] args) {
    Database database = new DataAPIClient("**APPLICATION_TOKEN**").getDatabase("**API_ENDPOINT**");

    DatabaseAdmin databaseAdmin = database.getDatabaseAdmin();

    FindRerankingProvidersResult result = databaseAdmin.findRerankingProviders();

    Map<String, RerankProvider> providers = result.getRerankingProviders();

    System.out.println(providers);
  }
}
