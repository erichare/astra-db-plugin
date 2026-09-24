using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Core;

namespace Examples;

public class Program
{
  static async Task Main()
  {
    // Instantiate the client
    var client = new DataAPIClient();

    // Connect to a database
    var database = client.GetDatabase(
      System.Environment.GetEnvironmentVariable("ASTRA_DB_API_ENDPOINT"),
      System.Environment.GetEnvironmentVariable("ASTRA_DB_APPLICATION_TOKEN")
    );

    // Create a collection
    var collection = await database.CreateCollectionAsync(
      "**COLLECTION_NAME**",
      new CreateCollectionOptions() { Keyspace = "**KEYSPACE_NAME**" }
    );
  }
}
