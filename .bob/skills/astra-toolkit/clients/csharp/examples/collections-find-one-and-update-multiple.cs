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

    // Update a document
    var filter = Builders<Document>.CollectionFilter.Eq("_id", "101");
    var updater = Builders<Document>.CollectionUpdate;
    var update = updater
      .Set("color", "blue")
      .Set("classes", new[] { "biology", "algebra", "swimming" })
      .Unset("phone")
      .Increment("age", 1);
    var result = await collection.FindOneAndUpdateAsync(filter, update);

    Console.WriteLine(JsonSerializer.Serialize(result));
  }
}
