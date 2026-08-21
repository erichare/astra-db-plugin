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
      { "$vector", new double[] { 0.08f, -0.62f, 0.39f } },
      { "name", "Jane Doe" },
    };
    var result = await collection.InsertOneAsync(document);

    Console.WriteLine(result.InsertedId);
  }
}
