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

    // List table names
    var names = await database.ListTableNamesAsync();

    Console.WriteLine(JsonSerializer.Serialize(names));
  }
}
