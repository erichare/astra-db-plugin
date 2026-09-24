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
      { "name", "Jane Doe" },
      { "age", 42 },
    };
    var document2 = new Document()
    {
      { "nickname", "Bobby" },
      { "color", "blue" },
      { "foods", new[] { "carrots", "chocolate" } },
    };
    var options = new CollectionInsertManyOptions()
    {
      ChunkSize = 2,
      Concurrency = 2,
      Ordered = false,
    };
    var result = await collection.InsertManyAsync(
      [document1, document2],
      options
    );

    foreach (var id in result.InsertedIds)
    {
      Console.WriteLine(id);
    }
  }
}
