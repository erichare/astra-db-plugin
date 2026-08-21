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

  [ColumnName("genres")]
  public HashSet<string>? Genres { get; set; }

  [ColumnName("due_date")]
  public DateOnly? DueDate { get; set; }

  [ColumnName("rating")]
  public double? Rating { get; set; }
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

    // Insert rows into the table
    var rows = new List<Book>()
    {
      new Book()
      {
        Title = "Computed Wilderness",
        Author = "Ryan Eau",
        NumberOfPages = 432,
        DueDate = new DateOnly(2024, 12, 18),
        Genres = new HashSet<string> { "History", "Biography" },
      },
      new Book()
      {
        Title = "Desert Peace",
        Author = "Walter Dray",
        NumberOfPages = 355,
        Rating = 4.5,
      },
    };

    await table.InsertManyAsync(rows);
  }
}
