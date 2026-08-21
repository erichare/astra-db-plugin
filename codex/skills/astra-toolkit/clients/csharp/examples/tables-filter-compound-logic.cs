using System.Text.Json;
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

  [ColumnName("number_of_pages")]
  public int? NumberOfPages { get; set; }

  [ColumnName("publication_year")]
  public int? PublicationYear { get; set; }

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

    // Find a row
    var filterBuilder = Builders<Book>.TableFilter;
    var filter = filterBuilder.And(
      filterBuilder.Or(
        filterBuilder.Eq(b => b.IsCheckedOut, false),
        filterBuilder.Lt(b => b.NumberOfPages, 300)
      ),
      filterBuilder.Or(
        filterBuilder.Lt(b => b.Rating, 4.3f),
        filterBuilder.Gte(b => b.PublicationYear, 2002)
      )
    );

    var result = await table.FindOneAsync(filter);

    Console.WriteLine(JsonSerializer.Serialize(result));
  }
}
