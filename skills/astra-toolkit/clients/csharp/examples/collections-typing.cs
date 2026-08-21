using System.Text.Json;
using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Collections;
using DataStax.AstraDB.DataApi.Core;
using DataStax.AstraDB.DataApi.Core.Query;
using DataStax.AstraDB.DataApi.SerDes;

namespace Examples;

[CollectionName("**COLLECTION_NAME**")]
[CollectionVectorize(
  "nvidia",
  "nvidia/nv-embedqa-e5-v5",
  SimilarityMetric.Cosine
)]
[LexicalOptions(
  TokenizerName = "standard",
  Filters = new[] { "lowercase", "stop", "porterstem", "asciifolding" },
  CharacterFilters = new string[] { }
)]
public class ExampleDocument
{
  [DocumentId]
  public Guid? Id { get; set; }

  [DocumentMapping(DocumentMappingField.Vector)]
  public float[]? VectorEmbeddings { get; set; }

  [DocumentMapping(DocumentMappingField.Vectorize)]
  public string? StringToVectorize { get; set; }

  [DocumentMapping(DocumentMappingField.Lexical)]
  public string? StringForLexical { get; set; }

  [DocumentMapping(DocumentMappingField.Similarity)]
  public double? Similarity { get; set; }

  public string? Title { get; set; }

  public int? NumberOfPages { get; set; }

  public bool? IsCheckedOut { get; set; }
}

public class Program
{
  static async Task Main()
  {
    // Get an existing collection
    var client = new DataAPIClient();
    var database = client.GetDatabase(
      "**API_ENDPOINT**",
      "**APPLICATION_TOKEN**"
    );
    var collection = database.GetCollection<ExampleDocument>();

    // Insert documents
    var insertionResult = await collection.InsertManyAsync(
      [
        new ExampleDocument()
        {
          VectorEmbeddings = [0.08f, -0.62f, 0.39f],
          Title = "Ocean Depths",
          NumberOfPages = 237,
          IsCheckedOut = false,
        },
        new ExampleDocument()
        {
          StringToVectorize =
            "A thrilling novel about the future of flight.",
          Title = "Sky Limits",
          NumberOfPages = 298,
        },
        new ExampleDocument()
        {
          Id = Guid.CreateVersion7(),
          Title = "Open Plains",
          IsCheckedOut = true,
        },
      ]
    );

    // Find documents
    var filterBuilder = Builders<ExampleDocument>.CollectionFilter;
    var filter = filterBuilder.And(
      filterBuilder.Eq(x => x.IsCheckedOut, false),
      filterBuilder.Lt(x => x.NumberOfPages, 300)
    );
    var result = collection.Find(
      filter,
      new CollectionFindOptions<ExampleDocument>()
      {
        Projection = Builders<ExampleDocument>
          .Projection.Include(x => x.Title)
          .Include(x => x.IsCheckedOut),
      }
    );

    await foreach (var document in result)
    {
      Console.WriteLine(JsonSerializer.Serialize(document));
    }
  }
}
