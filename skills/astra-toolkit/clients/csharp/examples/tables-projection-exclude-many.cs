using System.Text.Json;
using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Core;
using DataStax.AstraDB.DataApi.Core.Query;
using DataStax.AstraDB.DataApi.Tables;

namespace Examples;

public class Book
{
  [ColumnPrimaryKey(1)]
  [ColumnName("title")]
  public string Title { get; set; } = null!;

  [ColumnPrimaryKey(2)]
  [ColumnName("author")]
  public string Author { get; set; } = null!;

  [ColumnName("is_checked_out")]
  public bool? IsCheckedOut { get; set; }

  [ColumnName("number_of_pages")]
  public int? NumberOfPages { get; set; }
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
    var table = database.GetTable<Book>("**TABLE_NAME**");

    // Use a projection
    var filterBuilder = Builders<Book>.TableFilter;
    var filter = filterBuilder.Lt(b => b.NumberOfPages, 300);
    var projection = Builders<Book>
      .Projection.Exclude(b => b.IsCheckedOut)
      .Exclude(b => b.Title);

    var results = table.Find(
      filter,
      new TableFindOptions<Book>() { Projection = projection }
    );

    await foreach (var row in results)
    {
      Console.WriteLine(JsonSerializer.Serialize(row));
    }
  }
}
