using System.Text.Json;
using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Core;
using DataStax.AstraDB.DataApi.Core.Query;
using DataStax.AstraDB.DataApi.SerDes;
using DataStax.AstraDB.DataApi.Tables;

namespace Examples;

[TableName("**TABLE_NAME**")]
public class ExampleRow
{
  [ColumnPrimaryKey(1)]
  [ColumnName("title")]
  public string Title { get; set; } = null!;

  [ColumnPrimaryKey(2)]
  [ColumnName("rating")]
  public double Rating { get; set; }

  [ColumnVectorize(
    provider: "nvidia",
    modelName: "nvidia/nv-embedqa-e5-v5",
    dimension: 1024
  )]
  [ColumnName("example_vectorize")]
  public object? ExampleVectorize { get; set; }

  [ColumnVector(1024)]
  [ColumnName("example_vector")]
  public double[]? ExampleVector { get; set; }

  [ColumnPrimaryKeySort(1, SortDirection.Ascending)]
  [ColumnName("number_of_pages")]
  public int? NumberOfPages { get; set; }

  [ColumnPrimaryKeySort(2, SortDirection.Descending)]
  [ColumnName("is_checked_out")]
  public bool? IsCheckedOut { get; set; }

  [ColumnName("editor")]
  public Person? Editor { get; set; }

  [ColumnJsonString]
  [ColumnName("review")]
  public List<Review>? Reviews { get; set; }

  [ColumnIgnore]
  public TimeUuid TimeUuid { get; set; }

  [ColumnIgnore]
  [ColumnMapping(ColumnMappingField.Similarity)]
  public double? Similarity { get; set; }
}

[UserDefinedType("person")]
public class Person
{
  [ColumnName("name")]
  public string? Name { get; set; }

  [ColumnName("level")]
  public int? Level { get; set; }
};

public class Review
{
  public string? CustomerName { get; set; }
  public int Rating { get; set; }
  public string? Comment { get; set; }
  public DateTime ReviewDate { get; set; }
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
    var table = database.GetTable<ExampleRow>();

    // Insert rows into the table
    var rows = new List<ExampleRow>()
    {
      new ExampleRow()
      {
        ExampleVector = [0.08f, -0.62f, 0.39f],
        Title = "Ocean Depths",
        Rating = 4.5,
        NumberOfPages = 237,
        IsCheckedOut = false,
      },
      new ExampleRow()
      {
        ExampleVectorize =
          "A thrilling novel about the future of flight.",
        Title = "Sky Limits",
        NumberOfPages = 298,
        IsCheckedOut = true,
        Rating = 3.9,
      },
      new ExampleRow()
      {
        Title = "Open Plains",
        Rating = 4.2,
        IsCheckedOut = true,
        NumberOfPages = 499,
      },
    };

    await table.InsertManyAsync(rows);

    // Find rows
    var filterBuilder = Builders<ExampleRow>.TableFilter;
    var filter = filterBuilder.And(
      filterBuilder.Eq(b => b.IsCheckedOut, false),
      filterBuilder.Lt(b => b.NumberOfPages, 300)
    );

    var results = table.Find(
      filter,
      new TableFindOptions<ExampleRow>()
      {
        Sort = Builders<ExampleRow>
          .TableSort.Ascending(b => b.NumberOfPages)
          .Descending(b => b.Title),
        Projection = Builders<ExampleRow>
          .Projection.Include(b => b.IsCheckedOut)
          .Include(b => b.Title),
      }
    );

    await foreach (var row in results)
    {
      Console.WriteLine(JsonSerializer.Serialize(row));
    }
  }
}
