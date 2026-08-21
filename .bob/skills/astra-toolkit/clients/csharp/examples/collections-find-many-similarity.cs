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
    var result = collection.Find(
      new CollectionFindOptions<Document>()
      {
        Sort = Builders<Document>.CollectionSort.Vectorize(
          "Text to vectorize"
        ),
        IncludeSimilarity = true,
      }
    );

    await foreach (var document in result)
    {
      Console.WriteLine(
        JsonSerializer.Serialize(document["$similarity"])
      );
    }
  }
}
