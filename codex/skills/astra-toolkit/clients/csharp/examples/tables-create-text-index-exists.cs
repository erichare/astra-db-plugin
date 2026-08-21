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
    await table.CreateTextIndexAsync(
      "**INDEX_NAME**",
      "**TEXT_COLUMN_NAME**",
      new CreateTextIndexOptions() { IfNotExists = true }
    );
  }
}
