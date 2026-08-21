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

    // Insert documents to the collection
    var document1 = new Document()
    {
      { "name", "Jane Doe" },
      { "$vector", new double[] { 0.08f, -0.62f, 0.39f } },
      { "$lexical", "An author who writes SciFi and fantasy novels." },
    };
    var document2 = new Document()
    {
      { "name", "Mary Day" },
      {
        "$vectorize",
        "An athlete who loves biking, hiking, running, and swimming in the outdoors"
      },
      {
        "$lexical",
        "She shares her love of triathlons by coaching kids after school."
      },
    };
    var document3 = new Document()
    {
      { "name", "Bobby" },
      { "$hybrid", "A software developer who enjoys managing databases" },
    };
    var result = await collection.InsertManyAsync(
      [document1, document2, document3]
    );

    foreach (var id in result.InsertedIds)
    {
      Console.WriteLine(id);
    }
  }
}
