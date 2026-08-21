using System.Text.Json;
using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Collections;
using DataStax.AstraDB.DataApi.Core;
using DataStax.AstraDB.DataApi.Core.Query;

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
    var filterBuilder = Builders<Document>.CollectionFilter;
    var filter = filterBuilder.And(
      filterBuilder.Eq("title", "Name of the Mountain"),
      filterBuilder.Eq("author", "Gina Marlin")
    );

    var update = Builders<Document>
      .CollectionUpdate.SetOnInsert("rating", 5.0)
      .SetOnInsert("is_checked_out", false);
    var updateOptions = new CollectionUpdateOneOptions<Document>()
    {
      Upsert = true,
    };
    var result = await collection.UpdateOneAsync(
      filter,
      update,
      updateOptions
    );

    Console.WriteLine(JsonSerializer.Serialize(result));
  }
}
