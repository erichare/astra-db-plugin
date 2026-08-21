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
    var table = database.GetTable("**TABLE_NAME**");

    // List indexes
    var indexes = await table.ListIndexesAsync();
    Console.WriteLine(JsonSerializer.Serialize(indexes));
  }
}
