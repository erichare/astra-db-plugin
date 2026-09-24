using DataStax.AstraDB.DataApi;

namespace Examples;

public class Program
{
  static async Task Main()
  {
    var client = new DataAPIClient(System.Environment.GetEnvironmentVariable("ASTRA_DB_APPLICATION_TOKEN"));

    var admin = client.GetAstraDatabasesAdmin();

    var databases = await admin.ListDatabasesAsync();
  }
}
