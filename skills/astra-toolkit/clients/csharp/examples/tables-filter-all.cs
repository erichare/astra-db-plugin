using System.Text.Json;
using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Core;
using DataStax.AstraDB.DataApi.Tables;

namespace Examples;

public class Book
{
  [ColumnPrimaryKey]
  [ColumnName("title")]
  public string Title { get; set; } = null!;

  [ColumnName("genres")]
  public string[]? Genres { get; set; }
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
    var filter = filterBuilder.All(
      b => b.Genres,
      new[] { "Fantasy", "Romance" }
    );

    var result = await table.FindOneAsync(filter);

    Console.WriteLine(JsonSerializer.Serialize(result));
  }
}
