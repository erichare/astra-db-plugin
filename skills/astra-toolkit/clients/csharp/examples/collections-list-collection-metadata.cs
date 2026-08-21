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
      "**API_ENDPOINT**",
      "**APPLICATION_TOKEN**"
    );

    // List collections
    var collectionMetadata = await database.ListCollectionsAsync();

    Console.WriteLine(JsonSerializer.Serialize(collectionMetadata));
  }
}
