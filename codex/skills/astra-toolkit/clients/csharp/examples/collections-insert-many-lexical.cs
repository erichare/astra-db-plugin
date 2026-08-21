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
      { "name", "Jane Doe" },
      { "$lexical", "An author who writes SciFi and fantasy novels." },
    };
    var document2 = new Document()
    {
      { "name", "Mary Day" },
      {
        "$lexical",
        "An active hiker, runner, and triathlete who loves the outdoors."
      },
    };
    var result = await collection.InsertManyAsync([document1, document2]);

    foreach (var id in result.InsertedIds)
    {
      Console.WriteLine(id);
    }
  }
}
