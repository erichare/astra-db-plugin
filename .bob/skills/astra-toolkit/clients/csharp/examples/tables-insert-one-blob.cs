using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Tables;

namespace Examples;

public class ExampleRow
{
  [ColumnPrimaryKey]
  [ColumnName("title")]
  public string Title { get; set; } = null!;

  [ColumnName("example_blob")]
  public byte[]? ExampleBlob { get; set; }
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
    var table = database.GetTable<ExampleRow>("**TABLE_NAME**");

    // Insert a binary value
    var row = new ExampleRow()
    {
      ExampleBlob = new byte[]
      {
        0x3D,
        0xFB,
        0xE7,
        0x6D,
        0x3E,
        0xE9,
        0x78,
        0xD5,
        0x3F,
        0x49,
        0xFB,
        0xE7,
      },
      Title = "Example",
    };

    await table.InsertOneAsync(row);
  }
}
