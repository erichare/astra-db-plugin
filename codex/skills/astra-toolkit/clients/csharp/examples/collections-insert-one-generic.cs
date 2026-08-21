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

    // Insert a document into the collection
    var document = new Document()
    {
      { "title", "Hidden Shadows of the Past" },
      {
        "genres",
        new List<string>
        {
          "Biography",
          "Graphic Novel",
          "Dystopian",
          "Drama",
        }
      },
      {
        "metadata",
        new Dictionary<string, object?>
        {
          { "isbn", "978-1-905585-40-3" },
          { "language", "French" },
          { "edition", "Anniversary Edition" },
        }
      },
      { "number_of_pages", 245 },
    };
    var result = await collection.InsertOneAsync(document);

    Console.WriteLine(result.InsertedId);
  }
}
