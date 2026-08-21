using DataStax.AstraDB.DataApi;

namespace Examples;

public class Program
{
  static async Task Main()
  {
    var client = new DataAPIClient("**APPLICATION_TOKEN**");

    var admin = client.GetAstraDatabasesAdmin();

    await admin.DropDatabaseAsync("**DATABASE_ID**");
  }
}
