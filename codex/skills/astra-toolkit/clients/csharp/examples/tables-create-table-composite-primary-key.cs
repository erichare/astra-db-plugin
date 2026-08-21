using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Tables;

namespace Examples;

// Define the type for the row
[TableName("**TABLE_NAME**")]
public class Book
{
  [ColumnPrimaryKey(1)]
  [ColumnName("title")]
  public string Title { get; set; } = null!;

  [ColumnName("number_of_pages")]
  public int? NumberOfPages { get; set; }

  [ColumnPrimaryKey(2)]
  [ColumnName("rating")]
  public float Rating { get; set; }

  [ColumnName("genres")]
  public string[]? Genres { get; set; }

  [ColumnName("metadata")]
  public Dictionary<string, string>? Metadata { get; set; }

  [ColumnName("is_checked_out")]
  public bool? IsCheckedOut { get; set; }

  [ColumnName("due_date")]
  public DateOnly? DueDate { get; set; }
}

public class Program
{
  static async Task Main()
  {
    // Instantiate the client
    var client = new DataAPIClient();

    // Connect to a database
    var database = client.GetDatabase(
      "**API_ENDPOINT**",
      "**APPLICATION_TOKEN**"
    );

    // Create a table
    var table = await database.CreateTableAsync<Book>();
  }
}
