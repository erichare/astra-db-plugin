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
    var findOptions = new TableFindOneOptions<Row>()
    {
      Sort = Builders<Row>
        .TableSort.Ascending("rating")
        .Descending("title"),
    };
    var result = await table.FindOneAsync(findOptions);

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

  [ColumnName("rating")]
  public float? Rating { get; set; }
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
    var findOptions = new TableFindOneOptions<Book>()
    {
      Sort = Builders<Book>
        .TableSort.Ascending(b => b.Rating)
        .Descending(b => b.Title),
    };
    var result = await table.FindOneAsync(findOptions);

    Console.WriteLine(JsonSerializer.Serialize(result));
  }
}
