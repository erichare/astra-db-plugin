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
    var result = await collection.ReplaceOneAsync(filter, replacement);

    Console.WriteLine(result.MatchedCount);
    Console.WriteLine(result.ModifiedCount);
  }
}
