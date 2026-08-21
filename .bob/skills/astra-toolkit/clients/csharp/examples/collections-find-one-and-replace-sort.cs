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
    var filter = Builders<Document>.CollectionFilter.Eq(
      "metadata.language",
      "English"
    );
    var replaceOptions =
      new CollectionFindOneAndReplaceOptions<Document>()
      {
        Sort = Builders<Document>
          .CollectionSort.Ascending("rating")
          .Descending("title"),
      };
    var replacement = new Document()
    {
      { "is_checked_out", false },
      { "number_of_pages", 400 },
    };
    var result = await collection.FindOneAndReplaceAsync(
      filter,
      replacement,
      replaceOptions
    );

    Console.WriteLine(JsonSerializer.Serialize(result));
  }
}
