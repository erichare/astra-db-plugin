using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Core;

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

    await databaseAdmin.CreateKeyspaceAsync(
      "**KEYSPACE_NAME**",
      new() { updateDBKeyspace = true }
    );
  }
}
