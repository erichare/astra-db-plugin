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
    var filterBuilder = Builders<Document>.CollectionFilter;
    var filter = filterBuilder.Eq("metadata.language", "English");
    var replacement = new Document()
    {
      { "title", "Hidden Shadows of the Past" },
      { "number_of_pages", 481 },
      {
        "genres",
        new[] { "Biography", "Graphic Novel", "Dystopian", "Drama" }
      },
      {
        "metadata",
        new Document
        {
          { "isbn", "978-1-905585-40-3" },
          { "language", "French" },
          { "edition", "Anniversary Edition" },
        }
      },
    };
    var result = await collection.FindOneAndReplaceAsync(
      filter,
      replacement
    );

    Console.WriteLine(JsonSerializer.Serialize(result));
  }
}
