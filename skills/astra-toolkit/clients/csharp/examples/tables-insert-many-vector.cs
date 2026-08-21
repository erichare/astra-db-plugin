using DataStax.AstraDB.DataApi;
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

  [ColumnVector(3)]
  [ColumnName("summary_genres_vector")]
  public double[]? SummaryGenresVector { get; set; }
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
        SummaryGenresVector = new double[] { 0.08f, -0.62f, 0.39f },
      },
      new Book()
      {
        Title = "Desert Peace",
        Author = "Walter Dray",
        SummaryGenresVector = new double[] { 0.12f, 0.53f, 0.32f },
      },
    };

    await table.InsertManyAsync(rows);
  }
}
