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
    var filter = Builders<Document>.CollectionFilter.Eq(
      "metadata.language",
      "English"
    );
    var update = Builders<Document>.CollectionUpdate.Set("color", "blue");
    var updateOptions = new CollectionFindOneAndUpdateOptions<Document>()
    {
      Projection = Builders<Document>
        .Projection.Exclude("is_checked_out")
        .Exclude("title"),
    };
    var result = await collection.FindOneAndUpdateAsync(
      filter,
      update,
      updateOptions
    );

    Console.WriteLine(JsonSerializer.Serialize(result));
  }
}
