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

    // Find a document
    var filterBuilder = Builders<Document>.CollectionFilter;
    var filter = filterBuilder.Not(
      filterBuilder.Eq("is_checked_out", false)
    );

    var result = await collection.FindOneAsync(filter);

    Console.WriteLine(JsonSerializer.Serialize(result));
  }
}
