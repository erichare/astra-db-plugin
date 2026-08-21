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
    var result = collection.FindAndRerank(
      new CollectionFindAndRerankOptions<Document>
      {
        Sort = Builders<Document>.CollectionFindAndRerankSort.Hybrid(
          new float[] { 0.08f, -0.62f, 0.39f },
          "house hill grassy"
        ),
        VectorLimit = 8,
        LexicalLimit = 20,
        RerankQuery = "A tree in the woods",
        RerankOn = "$lexical",
      }
    );

    await foreach (var document in result)
    {
      Console.WriteLine(JsonSerializer.Serialize(document.Document));
    }
  }
}
