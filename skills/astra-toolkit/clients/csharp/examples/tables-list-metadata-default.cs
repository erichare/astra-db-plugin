using System.Text.Json;
using DataStax.AstraDB.DataApi;

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

    // List table metadata
    var result = await database.ListTablesAsync();

    Console.WriteLine(JsonSerializer.Serialize(result));
  }
}
