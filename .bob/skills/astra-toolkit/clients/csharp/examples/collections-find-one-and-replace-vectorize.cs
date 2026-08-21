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

    // Replace a document
    var replaceOptions =
      new CollectionFindOneAndReplaceOptions<Document>()
      {
        Sort = Builders<Document>.CollectionSort.Vectorize(
          "Text to vectorize"
        ),
      };
    var replacement = new Document()
    {
      { "name", "Jane Doe" },
      { "age", 42 },
    };
    var result = await collection.FindOneAndReplaceAsync(
      null,
      replacement,
      replaceOptions
    );

    Console.WriteLine(JsonSerializer.Serialize(result));
  }
}
