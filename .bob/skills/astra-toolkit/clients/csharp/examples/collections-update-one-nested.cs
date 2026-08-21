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
      .Set("address.city", "Austin")
      .Set("classes.2", "biology");
    var result = await collection.UpdateOneAsync(filter, update);

    Console.WriteLine(result.MatchedCount);
    Console.WriteLine(result.ModifiedCount);
  }
}
