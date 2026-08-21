using System.Text.Json;
using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Collections;
using DataStax.AstraDB.DataApi.Core;

namespace Examples;

public class Program
{
  static async Task Main()
  {
    // Get an existing collection
    var client = new DataAPIClient();
    var database = client.GetDatabase(
      "**API_ENDPOINT**",
      "**APPLICATION_TOKEN**"
    );
    var collection = database.GetCollection("**COLLECTION_NAME**");

    // Replace a document
    var filter = Builders<Document>.CollectionFilter.Eq("_id", "101");
    var replacement = new Document()
    {
      { "name", "Jane Doe" },
      { "age", 42 },
    };
    var result = await collection.FindOneAndReplaceAsync(
      filter,
      replacement
    );

    Console.WriteLine(JsonSerializer.Serialize(result));
  }
}
