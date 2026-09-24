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
      System.Environment.GetEnvironmentVariable("ASTRA_DB_API_ENDPOINT"),
      System.Environment.GetEnvironmentVariable("ASTRA_DB_APPLICATION_TOKEN")
    );
    var table = database.GetTable("**TABLE_NAME**");

    // Delete rows
    var filter = Builders<Row>.TableFilter.Eq(
      "title",
      "Hidden Shadows of the Past"
    );
    await table.DeleteManyAsync(filter);
  }
}
