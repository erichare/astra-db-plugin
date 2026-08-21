using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Core;

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

    // Drop a user-defined type
    await database.DropTypeAsync(
      "**UDT_NAME**",
      new DropTypeOptions() { IfExists = true }
    );
  }
}
