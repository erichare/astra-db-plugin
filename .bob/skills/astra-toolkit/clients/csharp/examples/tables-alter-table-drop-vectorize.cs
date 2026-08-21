using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Tables;

namespace Examples;

public abstract class ExampleRowBase
{
  [ColumnPrimaryKey(1)]
  [ColumnName("title")]
  public string Title { get; set; } = null!;

  [ColumnPrimaryKey(2)]
  [ColumnName("author")]
  public string Author { get; set; } = null!;
}

public class ExampleRowBeforeAlter : ExampleRowBase
{
  [ColumnVectorize(
    provider: "nvidia",
    modelName: "nvidia/nv-embedqa-e5-v5",
    dimension: 1024
  )]
  [ColumnName("plot_synopsis")]
  public object? PlotSynopsis { get; set; }
}

public class ExampleRowAfterAlter : ExampleRowBase
{
  [ColumnVector(1024)]
  [ColumnName("plot_synopsis")]
  public float[]? PlotSynopsis { get; set; }
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

    // Remove automatic embedding generation
    var alteredTable = await table.AlterAsync<ExampleRowAfterAlter>(
      new AlterTableDropVectorize(new[] { "plot_synopsis" })
    );
  }
}
