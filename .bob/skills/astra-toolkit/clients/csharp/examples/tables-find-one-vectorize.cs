using System.Text.Json;
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

    // Find a row
    var findOptions = new TableFindOneOptions<Row>()
    {
      Sort = Builders<Row>.TableSort.Vectorize(
        "summary_genres_vector",
        "Text to vectorize"
      ),
    };
    var result = await table.FindOneAsync(findOptions);

    Console.WriteLine(JsonSerializer.Serialize(result));
  }
}

// ==============  BOUNDARY BETWEEN EXAMPLE SNIPPETS  ==============

using System.Text.Json;
using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Core;
using DataStax.AstraDB.DataApi.Core.Query;
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
    var findOptions = new TableFindOneOptions<Book>()
    {
      Sort = Builders<Book>.TableSort.Vectorize(
        b => b.SummaryGenresVector,
        "Text to vectorize"
      ),
    };
    var result = await table.FindOneAsync(findOptions);

    Console.WriteLine(JsonSerializer.Serialize(result));
  }
}
