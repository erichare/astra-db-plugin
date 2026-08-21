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
    var updateOptions = new CollectionFindOneAndUpdateOptions<Document>()
    {
      Sort = Builders<Document>
        .CollectionSort.Ascending("rating")
        .Descending("title"),
    };
    var update = Builders<Document>.CollectionUpdate.Set("color", "blue");
    var result = await collection.FindOneAndUpdateAsync(
      filter,
      update,
      updateOptions
    );

    Console.WriteLine(JsonSerializer.Serialize(result));
  }
}
