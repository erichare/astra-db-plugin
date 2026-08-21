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
    var result = await collection.InsertManyAsync(
      [
        new Document()
        {
          {
            "exampleBinary",
            new byte[]
            {
              0x3D,
              0xFB,
              0xE7,
              0x6D,
              0x3E,
              0xE9,
              0x78,
              0xD5,
              0x3F,
              0x49,
              0xFB,
              0xE7,
            }
          },
        },
      ]
    );

    foreach (var id in result.InsertedIds)
    {
      Console.WriteLine(id);
    }
  }
}
