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
      System.Environment.GetEnvironmentVariable("ASTRA_DB_API_ENDPOINT"),
      System.Environment.GetEnvironmentVariable("ASTRA_DB_APPLICATION_TOKEN")
    );
    var table = database.GetTable("**TABLE_NAME**");

    // Index a column
    await table.CreateTextIndexAsync(
      "**INDEX_NAME**",
      "**TEXT_COLUMN_NAME**",
      Builders.TableIndex.Text(
        new AnalyzerOptions
        {
          Tokenizer = new TokenizerOptions
          {
            Name = "standard",
            Arguments = new Dictionary<string, object>(),
          },
          Filters = { "lowercase", "stop", "porterstem", "asciifolding" },
          CharacterFilters = new List<string>(),
        }
      )
    );
  }
}
