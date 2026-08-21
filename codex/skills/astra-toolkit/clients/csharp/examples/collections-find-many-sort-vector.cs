using System.Text.Json;
using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Collections;
using DataStax.AstraDB.DataApi.Core;
using DataStax.AstraDB.DataApi.Core.Query;

namespace Examples;

public class Program
{
  static void Main()
  {
    // Get an existing collection
    var client = new DataAPIClient();
    var database = client.GetDatabase(
      "**API_ENDPOINT**",
      "**APPLICATION_TOKEN**"
    );
    var collection = database.GetCollection("**COLLECTION_NAME**");

    // Find documents
    var result = collection.Find(
      new CollectionFindOptions<Document>()
      {
        Sort = Builders<Document>.CollectionSort.Vectorize(
          "Text to vectorize"
        ),
        IncludeSortVector = true,
      }
    );

    // Inspect the sort vector
    Console.WriteLine(JsonSerializer.Serialize(result.GetSortVector()));
  }
}
