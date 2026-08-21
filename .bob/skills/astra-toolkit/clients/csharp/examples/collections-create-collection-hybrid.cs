using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Collections;
using DataStax.AstraDB.DataApi.Core;
using DataStax.AstraDB.DataApi.SerDes;

namespace Examples;

// Define the type for the collection
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
public class User
{
  [DocumentId]
  public Guid? Id { get; set; }

  public string Name { get; set; } = null!;

  public int? Age { get; set; }

  [DocumentMapping(DocumentMappingField.Vectorize)]
  public string StringToVectorize => Name;
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

    // Create a collection
    var definition = new CollectionDefinition()
    {
      Rerank = new RerankOptions()
      {
        Enabled = true,
        Service = new RerankServiceOptions()
        {
          Provider = "nvidia",
          ModelName = "nvidia/llama-3.2-nv-rerankqa-1b-v2",
        },
      },
    };
    var collection = await database.CreateCollectionAsync<User>(
      definition
    );
  }
}
