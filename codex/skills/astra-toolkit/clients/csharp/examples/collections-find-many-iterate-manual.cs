using System.Text.Json;
using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Collections;
using DataStax.AstraDB.DataApi.Core;
using DataStax.AstraDB.DataApi.Core.Query;

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

    // Create the filter
    var filterBuilder = Builders<Document>.CollectionFilter;
    var filter = filterBuilder.And(
      filterBuilder.Eq("is_checked_out", false),
      filterBuilder.Lt("number_of_pages", 300)
    );

    // Get the first page
    var cursor1 = collection.Find(filter);
    var page1 = await cursor1.FetchNextPageAsync();
    var results1 = page1.Results;
    foreach (var document in results1)
    {
      Console.WriteLine(JsonSerializer.Serialize(document));
    }
    var paginationState1 = page1.NextPageState;

    // Get the next page
    if (paginationState1 != null)
    {
      var cursor2 = collection.Find(
        filter,
        new CollectionFindOptions<Document>()
        {
          InitialPageState = paginationState1,
        }
      );
      var page2 = await cursor2.FetchNextPageAsync();
      var results2 = page2.Results;
      foreach (var document in results2)
      {
        Console.WriteLine(JsonSerializer.Serialize(document));
      }
      var paginationState2 = page2.NextPageState;
    }
  }
}
