using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Tables;

namespace Examples;

public class ExampleRowAfterAlter
{
  [ColumnPrimaryKey(1)]
  [ColumnName("title")]
  public string Title { get; set; } = null!;

  [ColumnPrimaryKey(2)]
  [ColumnName("author")]
  public string Author { get; set; } = null!;
}

public class ExampleRowBeforeAlter : ExampleRowAfterAlter
{
  [ColumnName("is_summer_reading")]
  public bool? IsSummerReading { get; set; }

  [ColumnName("library_branch")]
  public string[]? LibraryBranch { get; set; }
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

    // Drop columns
    var alteredTable = await table.AlterAsync<ExampleRowAfterAlter>(
      new AlterTableDropColumns(
        new[] { "is_summer_reading", "library_branch" }
      )
    );
  }
}
