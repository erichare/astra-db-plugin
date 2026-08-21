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

  [ColumnName("genres")]
  public HashSet<string>? Genres { get; set; }

  [ColumnName("topics")]
  public HashSet<string>? Topics { get; set; }
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

    // Update a row
    var filterBuilder = Builders<Book>.TableFilter;
    var filter = filterBuilder.And(
      filterBuilder.Eq(b => b.Title, "Hidden Shadows of the Past"),
      filterBuilder.Eq(b => b.Author, "John Anthony")
    );

    var update = Builders<Book>
      .TableUpdate.Push(x => x.Genres, "SciFi")
      .PushEach(x => x.Topics, ["robots", "AI"]);

    await table.UpdateOneAsync(filter, update);
  }
}
