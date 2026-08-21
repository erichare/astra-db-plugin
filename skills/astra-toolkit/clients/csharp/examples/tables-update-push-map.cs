using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Core;
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

  [ColumnName("map_column_int_str")]
  public Dictionary<int, string>? MapColumnIntStr { get; set; }

  [ColumnName("map_column_str_str")]
  public Dictionary<string, string>? MapColumnStrStr { get; set; }

  [ColumnName("map_column_int_str_2")]
  public Dictionary<int, string>? MapColumnIntStr2 { get; set; }

  [ColumnName("map_column_str_str_2")]
  public Dictionary<string, string>? MapColumnStrStr2 { get; set; }
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

    var filterBuilder = Builders<Book>.TableFilter;
    var filter = filterBuilder.And(
      filterBuilder.Eq(b => b.Title, "Hidden Shadows of the Past"),
      filterBuilder.Eq(b => b.Author, "John Anthony")
    );

    var update = Builders<Book>
      .TableUpdate.Push(
        b => b.MapColumnIntStr,
        new Dictionary<int, string> { { 1, "value1" } }
      )
      .Push(
        b => b.MapColumnStrStr,
        new Dictionary<string, string> { { "key1", "value1" } }
      )
      .PushEach(
        b => b.MapColumnIntStr2,
        new Dictionary<int, string> { { 1, "value1" }, { 2, "value2" } }
      )
      .PushEach(
        b => b.MapColumnStrStr2,
        new Dictionary<string, string>
        {
          { "key1", "value1" },
          { "key2", "value2" },
        }
      );

    await table.UpdateOneAsync(filter, update);
  }
}
