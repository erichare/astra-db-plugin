using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Tables;

namespace Examples;

public class Book
{
  [ColumnPrimaryKey(1)]
  [ColumnName("title")]
  public string? Title { get; set; }

  [ColumnPrimaryKey(2)]
  [ColumnName("author")]
  public string? Author { get; set; }

  [ColumnName("map_column_int_str")]
  public Dictionary<int, string>? MapColumnIntStr { get; set; }

  [ColumnName("map_column_str_str")]
  public Dictionary<string, string>? MapColumnStrStr { get; set; }
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

    // Insert a row into the table
    var row = new Book()
    {
      MapColumnIntStr = new Dictionary<int, string>
      {
        { 1, "value1" },
        { 2, "value2" },
      },
      MapColumnStrStr = new Dictionary<string, string>
      {
        { "key1", "value1" },
        { "key2", "value2" },
      },
      Title = "Once in a Living Memory",
      Author = "Kayla McMaster",
    };

    await table.InsertOneAsync(row);
  }
}
