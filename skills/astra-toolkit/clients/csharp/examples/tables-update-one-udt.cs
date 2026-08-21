using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Core;
using DataStax.AstraDB.DataApi.Tables;

namespace Examples;

[UserDefinedType("example_udt")]
public class ExampleUDT
{
  [ColumnName("email")]
  public string? Email { get; set; }

  [ColumnName("user_name")]
  public string? UserName { get; set; }
};

public class ExampleRow
{
  [ColumnPrimaryKey]
  [ColumnName("title")]
  public string Title { get; set; } = null!;

  [ColumnName("president")]
  public ExampleUDT? President { get; set; }

  [ColumnName("vice_president")]
  public ExampleUDT? VicePresident { get; set; }
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

    // Update a row
    var filter = Builders<ExampleRow>.TableFilter.Eq(
      x => x.Title,
      "Chemistry Club"
    );

    var update = Builders<ExampleRow>
      .TableUpdate.Set(
        x => x.President,
        new ExampleUDT { Email = "lisa@example.com", UserName = "lisa_m" }
      )
      .Set(
        x => x.VicePresident,
        new ExampleUDT
        {
          Email = "tanya@example.com",
          UserName = "tanya_o",
        }
      );

    await table.UpdateOneAsync(filter, update);
  }
}
