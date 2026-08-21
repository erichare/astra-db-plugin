using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Tables;

namespace Examples;

public class ExampleRowBeforeAlter
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
  [ColumnName("is_summer_reading")]
  public bool? IsSummerReading { get; set; }

  [ColumnName("library_branch")]
  public string? LibraryBranch { get; set; }
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

    // Add columns
    var newColumns = new Dictionary<string, AlterTableColumnDefinition>
    {
      ["is_summer_reading"] = new AlterTableColumnDefinition
      {
        Type = "boolean",
      },
      ["library_branch"] = new AlterTableColumnDefinition
      {
        Type = "text",
      },
    };

    var alteredTable = await table.AlterAsync<ExampleRowAfterAlter>(
      new AlterTableAddColumns(newColumns)
    );
  }
}
