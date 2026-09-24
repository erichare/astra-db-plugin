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
      System.Environment.GetEnvironmentVariable("ASTRA_DB_API_ENDPOINT"),
      System.Environment.GetEnvironmentVariable("ASTRA_DB_APPLICATION_TOKEN")
    );

    var databaseAdmin = database.GetAdmin();

    await databaseAdmin.CreateKeyspaceAsync(
      "**KEYSPACE_NAME**",
      new() { updateDBKeyspace = true }
    );
  }
}
