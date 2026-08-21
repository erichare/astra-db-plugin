using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Core;

namespace Examples;

public class Program
{
  static async Task Main()
  {
    // Get an existing database
    var client = new DataAPIClient();
    var database = client.GetDatabase(
      "**API_ENDPOINT**",
      "**APPLICATION_TOKEN**"
    );

    // Drop a table
    await database.DropTableAsync(
      "**TABLE_NAME**",
      new DropTableOptions() { IfExists = true }
    );
  }
}
