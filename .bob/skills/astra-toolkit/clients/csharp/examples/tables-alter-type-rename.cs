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

    // Rename fields in a user-defined type
    await database.AlterTypeAsync(
      "member",
      new AlterTypeRenameFields(
        new() { ["name"] = "first_name", ["is_active"] = "is_member" }
      )
    );
  }
}
