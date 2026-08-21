using System.Text.Json;
using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Core;
using DataStax.AstraDB.DataApi.Core.Query;
using DataStax.AstraDB.DataApi.Tables;

namespace Examples;

public class Program
{
  static async Task Main()
  {
    // Get an existing table
    var client = new DataAPIClient();
    var database = client.GetDatabase(
      "**API_ENDPOINT**",
      "**APPLICATION_TOKEN**"
    );
    var table = database.GetTable("**TABLE_NAME**");

    // Create the filter
    var filterBuilder = Builders<Row>.TableFilter;
    var filter = filterBuilder.And(
      filterBuilder.Eq("is_checked_out", false),
      filterBuilder.Lt("number_of_pages", 300)
    );

    // Get the first page
    var cursor1 = table.Find(filter);
    var page1 = await cursor1.FetchNextPageAsync();
    var results1 = page1.Results;
    foreach (var row in results1)
    {
      Console.WriteLine(JsonSerializer.Serialize(row));
    }
    var paginationState1 = page1.NextPageState;

    // Get the next page
    if (paginationState1 != null)
    {
      var cursor2 = table.Find(
        filter,
        new TableFindOptions<Row>()
        {
          InitialPageState = paginationState1,
        }
      );
      var page2 = await cursor2.FetchNextPageAsync();
      var results2 = page2.Results;
      foreach (var row in results2)
      {
        Console.WriteLine(JsonSerializer.Serialize(row));
      }
      var paginationState2 = page2.NextPageState;
    }
  }
}
