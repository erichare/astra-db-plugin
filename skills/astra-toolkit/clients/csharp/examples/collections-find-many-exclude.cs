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

    // Find documents
    var filterBuilder = Builders<Document>.CollectionFilter;
    var filter = filterBuilder.Eq("metadata.language", "English");

    var projection = Builders<Document>
      .Projection.Exclude("is_checked_out")
      .Exclude("title");

    var result = collection.Find(
      filter,
      new CollectionFindOptions<Document>() { Projection = projection }
    );

    await foreach (var document in result)
    {
      Console.WriteLine(JsonSerializer.Serialize(document));
    }
  }
}
