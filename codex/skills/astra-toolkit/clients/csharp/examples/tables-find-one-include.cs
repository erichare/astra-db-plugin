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

    // Find a row
    var filterBuilder = Builders<Row>.TableFilter;
    var filter = filterBuilder.And(
      filterBuilder.Eq("is_checked_out", false),
      filterBuilder.Lt("number_of_pages", 300)
    );

    var findOptions = new TableFindOneOptions<Row>()
    {
      Projection = Builders<Row>
        .Projection.Include("is_checked_out")
        .Include("title"),
    };

    var result = await table.FindOneAsync(filter, findOptions);

    Console.WriteLine(JsonSerializer.Serialize(result));
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

    // Find a row
    var filterBuilder = Builders<Book>.TableFilter;
    var filter = filterBuilder.And(
      filterBuilder.Eq(b => b.IsCheckedOut, false),
      filterBuilder.Lt(b => b.NumberOfPages, 300)
    );

    var findOptions = new TableFindOneOptions<Book>()
    {
      Projection = Builders<Book>
        .Projection.Include(b => b.IsCheckedOut)
        .Include(b => b.Title),
    };

    var result = await table.FindOneAsync(filter, findOptions);

    Console.WriteLine(JsonSerializer.Serialize(result));
  }
}
