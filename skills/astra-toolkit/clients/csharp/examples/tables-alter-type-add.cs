using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Tables;
using DataStax.AstraDB.DataApi.Utils;

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

    // Add fields to a user-defined type
    await database.AlterTypeAsync(
      "member",
      new AlterTypeAddFields(
        new()
        {
          ["email"] = DataAPIType.Text(),
          ["credits"] = DataAPIType.Int(),
        }
      )
    );
  }
}
