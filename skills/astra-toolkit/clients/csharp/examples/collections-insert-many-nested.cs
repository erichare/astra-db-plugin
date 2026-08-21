using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Collections;

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

    // Insert documents to the collection
    var document1 = new Document()
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
    };
    var document2 = new Document()
    {
      { "title", "Bake a Dozen" },
      {
        "genres",
        new List<string> { "Biography", "Fiction" }
      },
      {
        "metadata",
        new Dictionary<string, object?>
        {
          { "isbn", "342-2-875587-50-2" },
          { "language", "English" },
          { "edition", "Illustrated Edition" },
        }
      },
    };
    var result = await collection.InsertManyAsync([document1, document2]);

    foreach (var id in result.InsertedIds)
    {
      Console.WriteLine(id);
    }
  }
}
