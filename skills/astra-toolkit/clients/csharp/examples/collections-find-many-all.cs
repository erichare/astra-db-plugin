using System.Text.Json;
using DataStax.AstraDB.DataApi;

namespace Examples;

public class Program
{
  static async Task Main()
  {
    // Get an existing collection
    var client = new DataAPIClient();
    var database = client.GetDatabase(
      System.Environment.GetEnvironmentVariable("ASTRA_DB_API_ENDPOINT"),
      System.Environment.GetEnvironmentVariable("ASTRA_DB_APPLICATION_TOKEN")
    );
    var collection = database.GetCollection("**COLLECTION_NAME**");

    // Find documents
    var result = collection.Find();

    await foreach (var document in result)
    {
      Console.WriteLine(JsonSerializer.Serialize(document));
    }
  }
}
