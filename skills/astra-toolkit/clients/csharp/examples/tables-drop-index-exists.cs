using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Tables;

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

    // Drop an index
    await database.DropTableIndexAsync(
      "**INDEX_NAME**",
      new DropTableIndexOptions() { IfExists = true }
    );
  }
}
