using System.Text.Json;
using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Core;

namespace Examples;

public class Program
{
  static async Task Main()
  {
    // Get a database
    var client = new DataAPIClient();
    var database = client.GetDatabase(
      System.Environment.GetEnvironmentVariable("ASTRA_DB_API_ENDPOINT"),
      System.Environment.GetEnvironmentVariable("ASTRA_DB_APPLICATION_TOKEN")
    );

    // List table names
    var names = await database.ListTableNamesAsync(
      new ListTableNamesOptions() { Keyspace = "**KEYSPACE_NAME**" }
    );

    Console.WriteLine(JsonSerializer.Serialize(names));
  }
}
