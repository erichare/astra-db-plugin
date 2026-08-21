using System.Text.Json;
using DataStax.AstraDB.DataApi;

namespace Examples;

public class Program
{
  static async Task Main()
  {
    // Get an existing table
    var client = new DataAPIClient();
    var database = client.GetDatabase(
      "**API_ENDPOINT**",
      "**APPLICATION_TOKEN**"
    );

    // List type names
    var names = await database.ListTypeNamesAsync();

    Console.WriteLine(JsonSerializer.Serialize(names));
  }
}
