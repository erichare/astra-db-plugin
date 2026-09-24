using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Tables;

namespace Examples;

// Define the type for the row
[TableName("**TABLE_NAME**")]
public class ExampleRow
{
  [ColumnPrimaryKey]
  [ColumnName("example_non_vector")]
  public string ExampleNonVector { get; set; } = null!;

  [ColumnVector(1024)]
  [ColumnName("example_vector")]
  public float[]? ExampleVector { get; set; }
}

public class Program
{
  static async Task Main()
  {
    // Instantiate the client
    var client = new DataAPIClient();

    // Connect to a database
    var database = client.GetDatabase(
      System.Environment.GetEnvironmentVariable("ASTRA_DB_API_ENDPOINT"),
      System.Environment.GetEnvironmentVariable("ASTRA_DB_APPLICATION_TOKEN")
    );

    // Create a table
    var table = await database.CreateTableAsync<ExampleRow>();
  }
}
