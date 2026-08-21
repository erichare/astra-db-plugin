using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Admin;

namespace Examples;

public class Program
{
  static async Task Main()
  {
    var client = new DataAPIClient("**APPLICATION_TOKEN**");

    var admin = client.GetAstraDatabasesAdmin();

    var databaseAdmin = await admin.CreateDatabaseAsync(
      new CreateDatabaseOptions()
      {
        Name = "**DATABASE_NAME**",
        CloudProvider = CloudProviderType.AWS,
        Region = "us-east-2",
      }
    );
  }
}
