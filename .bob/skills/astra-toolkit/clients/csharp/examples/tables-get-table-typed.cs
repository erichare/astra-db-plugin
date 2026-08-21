using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Core;
using DataStax.AstraDB.DataApi.Tables;

namespace Examples;

// Define the type for the table
[TableName("**TABLE_NAME**")]
public class Book
{
  [ColumnPrimaryKey(1)]
  [ColumnName("title")]
  public string Title { get; set; } = null!;

  [ColumnPrimaryKeySort(1, SortDirection.Ascending)]
  [ColumnName("number_of_pages")]
  public int NumberOfPages { get; set; }

  [ColumnPrimaryKey(2)]
  [ColumnName("rating")]
  public float Rating { get; set; }

  [ColumnName("genres")]
  public string[]? Genres { get; set; }

  [ColumnName("metadata")]
  public Dictionary<string, string>? Metadata { get; set; }

  [ColumnPrimaryKeySort(2, SortDirection.Descending)]
  [ColumnName("is_checked_out")]
  public bool IsCheckedOut { get; set; }

  [ColumnName("due_date")]
  public DateOnly? DueDate { get; set; }
}

public class Program
{
  static void Main()
  {
    // Get an existing table
    var client = new DataAPIClient();
    var database = client.GetDatabase(
      "**API_ENDPOINT**",
      "**APPLICATION_TOKEN**"
    );
    var table = database.GetTable<Book>();
  }
}
