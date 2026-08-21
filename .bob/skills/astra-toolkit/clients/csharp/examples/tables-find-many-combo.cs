using System.Text.Json;
using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Core;
using DataStax.AstraDB.DataApi.Core.Query;
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
    var table = database.GetTable("**TABLE_NAME**");

    // Find rows
    var filterBuilder = Builders<Row>.TableFilter;
    var filter = filterBuilder.And(
      filterBuilder.Eq("is_checked_out", false),
      filterBuilder.Lt("number_of_pages", 300)
    );

    var sort = Builders<Row>
      .TableSort.Ascending("rating")
      .Descending("title");

    var projection = Builders<Row>
      .Projection.Include("is_checked_out")
      .Include("title");

    var results = table.Find(
      filter,
      new TableFindOptions<Row>() { Sort = sort, Projection = projection }
    );

    await foreach (var row in results)
    {
      Console.WriteLine(JsonSerializer.Serialize(row));
    }
  }
}

// ==============  BOUNDARY BETWEEN EXAMPLE SNIPPETS  ==============

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

  [ColumnName("number_of_pages")]
  public int? NumberOfPages { get; set; }

  [ColumnName("rating")]
  public float? Rating { get; set; }

  [ColumnName("is_checked_out")]
  public bool? IsCheckedOut { get; set; }
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

    // Find rows
    var filterBuilder = Builders<Book>.TableFilter;
    var filter = filterBuilder.And(
      filterBuilder.Eq(b => b.IsCheckedOut, false),
      filterBuilder.Lt(b => b.NumberOfPages, 300)
    );

    var sort = Builders<Book>
      .TableSort.Ascending(b => b.Rating)
      .Descending(b => b.Title);

    var projection = Builders<Book>
      .Projection.Include(b => b.IsCheckedOut)
      .Include(b => b.Title);

    var results = table.Find(
      filter,
      new TableFindOptions<Book>()
      {
        Sort = sort,
        Projection = projection,
      }
    );

    await foreach (var row in results)
    {
      Console.WriteLine(JsonSerializer.Serialize(row));
    }
  }
}
