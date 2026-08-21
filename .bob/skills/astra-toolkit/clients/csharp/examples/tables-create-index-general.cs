using DataStax.AstraDB.DataApi;
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

    // Index a column
    await table.CreateIndexAsync("**INDEX_NAME**", "**COLUMN_NAME**");
  }
}
