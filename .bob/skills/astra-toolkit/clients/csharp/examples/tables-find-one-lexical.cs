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

  [ColumnName("summary")]
  public string Summary { get; set; } = null!;
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
    var filter = filterBuilder.LexicalMatch(
      b => b.Summary,
      "futuristic laboratory discovery"
    );
    var findOptions = new TableFindOneOptions<Book>()
    {
      Sort = Builders<Book>.TableSort.Lexical(
        b => b.Summary,
        "futuristic laboratory"
      ),
    };
    var result = await table.FindOneAsync(filter, findOptions);

    Console.WriteLine(JsonSerializer.Serialize(result));
  }
}
