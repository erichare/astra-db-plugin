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

  [ColumnVectorize(
    provider: "nvidia",
    modelName: "nvidia/nv-embedqa-e5-v5",
    dimension: 1024
  )]
  [ColumnName("summary_genres_vector")]
  public object? SummaryGenresVector { get; set; }

  [ColumnName("summary_genres_original_text")]
  public string? SummaryGenresOriginalText { get; set; }
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
      Title = "Computed Wilderness",
      Author = "Ryan Eau",
      SummaryGenresVector = "Text to vectorize",
      SummaryGenresOriginalText = "Text to vectorize",
    };

    await table.InsertOneAsync(row);
  }
}
