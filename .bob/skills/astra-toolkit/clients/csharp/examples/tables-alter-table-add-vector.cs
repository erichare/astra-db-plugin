using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Tables;

namespace Examples;

public abstract class ExampleRowBeforeAlter
{
  [ColumnPrimaryKey(1)]
  [ColumnName("title")]
  public string Title { get; set; } = null!;

  [ColumnPrimaryKey(2)]
  [ColumnName("author")]
  public string Author { get; set; } = null!;
}

public class ExampleRowAfterAlter : ExampleRowBeforeAlter
{
  [ColumnName("example_vector")]
  public float[]? ExampleVector { get; set; }
}

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
    var table = database.GetTable<ExampleRowBeforeAlter>(
      "**TABLE_NAME**"
    );

    // Add a vector column
    var newColumns = new Dictionary<
      string,
      AlterTableVectorColumnDefinition
    >
    {
      ["example_vector"] = new AlterTableVectorColumnDefinition
      {
        VectorDimension = 1024,
      },
    };

    var alteredTable = await table.AlterAsync<ExampleRowAfterAlter>(
      new AlterTableAddVectorColumns(newColumns)
    );
  }
}
