using DataStax.AstraDB.DataApi;

namespace Examples;

public class Program
{
  static async Task Main()
  {
    // Get an existing database
    var client = new DataAPIClient();
    var database = client.GetDatabase(
      "**API_ENDPOINT**",
      "**APPLICATION_TOKEN**"
    );

    var databaseAdmin = database.GetAdmin();

    var result = await databaseAdmin.FindRerankingProvidersAsync();

    var providers = result.RerankingProviders;
  }
}
