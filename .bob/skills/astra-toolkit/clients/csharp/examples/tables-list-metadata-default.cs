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
      "**API_ENDPOINT**",
      "**APPLICATION_TOKEN**"
    );

    // List table metadata
    var result = await database.ListTablesAsync();

    Console.WriteLine(JsonSerializer.Serialize(result));
  }
}
