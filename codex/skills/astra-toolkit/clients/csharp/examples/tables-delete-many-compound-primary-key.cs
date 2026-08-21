using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Core;
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

    // Delete rows
    var filterBuilder = Builders<Row>.TableFilter;
    var filter = filterBuilder.And(
      filterBuilder.Eq("title", "Hidden Shadows of the Past"),
      filterBuilder.Eq("rating", 4)
    );

    await table.DeleteManyAsync(filter);
  }
}
