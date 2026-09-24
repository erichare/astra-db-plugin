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
      System.Environment.GetEnvironmentVariable("ASTRA_DB_API_ENDPOINT"),
      System.Environment.GetEnvironmentVariable("ASTRA_DB_APPLICATION_TOKEN")
    );
    var collection = database.GetCollection("**COLLECTION_NAME**");

    // Insert documents to the collection
    var document1 = new Document()
    {
      { "name", "Melissa" },
      { "_id", Guid.CreateVersion7() },
    };
    var document2 = new Document()
    {
      { "name", "Bobby" },
      { "_id", "b_023" },
    };
    var result = await collection.InsertManyAsync([document1, document2]);

    foreach (var id in result.InsertedIds)
    {
      Console.WriteLine(id);
    }
  }
}
