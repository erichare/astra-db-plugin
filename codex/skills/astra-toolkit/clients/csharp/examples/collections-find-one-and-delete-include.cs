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

    // Delete a document
    var filter = Builders<Document>.CollectionFilter.Eq(
      "metadata.language",
      "English"
    );
    var findOptions = new CollectionFindOneAndDeleteOptions<Document>()
    {
      Projection = Builders<Document>
        .Projection.Include("is_checked_out")
        .Include("title"),
    };
    var result = await collection.FindOneAndDeleteAsync(
      filter,
      findOptions
    );

    Console.WriteLine(JsonSerializer.Serialize(result));
  }
}
