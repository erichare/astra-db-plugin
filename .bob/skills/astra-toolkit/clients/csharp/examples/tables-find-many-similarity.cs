using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Core;
using DataStax.AstraDB.DataApi.Core.Query;
using DataStax.AstraDB.DataApi.Tables;

namespace Examples;

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
    var table = database.GetTable("**TABLE_NAME**");

    // Find rows
    var results = table.Find(
      new TableFindOptions<Row>()
      {
        Sort = Builders<Row>.TableSort.Vector(
          "summary_genres_vector",
          new float[] { 0.08f, -0.62f, 0.39f }
        ),
        IncludeSimilarity = true,
      }
    );

    await foreach (var row in results)
    {
      Console.WriteLine(row["$similarity"]);
    }
  }
}

// ==============  BOUNDARY BETWEEN EXAMPLE SNIPPETS  ==============

using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Core;
using DataStax.AstraDB.DataApi.Core.Query;
using DataStax.AstraDB.DataApi.SerDes;
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

  [ColumnIgnore]
  [ColumnMapping(ColumnMappingField.Similarity)]
  public double? Similarity { get; set; }
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

    // Find rows
    var results = table.Find(
      new TableFindOptions<Book>()
      {
        Sort = Builders<Book>.TableSort.Vector(
          b => b.SummaryGenresVector,
          new float[] { 0.08f, -0.62f, 0.39f }
        ),
        IncludeSimilarity = true,
      }
    );

    await foreach (var row in results)
    {
      Console.WriteLine(row.Similarity);
    }
  }
}
