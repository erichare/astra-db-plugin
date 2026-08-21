// tag::type-definition[]
using System.Text.Json.Serialization;
using DataStax.AstraDB.DataApi.SerDes;
using DataStax.AstraDB.DataApi.Collections;
// end::type-definition[]
// tag::pre-collection-definition[]
using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Admin;
using DataStax.AstraDB.DataApi.Core;

namespace Examples;

// end::pre-collection-definition[]

// tag::type-definition[]
// Define the type for the collection
// end::type-definition[]
// tag::collection-definition-external-provider-typed[]
[CollectionVectorize(
  "{embedding-provider-name-api}",
  "MODEL_NAME",
  SimilarityMetric.SIMILARITY_METRIC,
  MODEL_DIMENSIONS,
  new string[]
  {
    "providerKey",
    "API_KEY_NAME",
  }
)]
// end::collection-definition-external-provider-typed[]
// tag::collection-definition-hugging-face-dedicated-typed[]
[CollectionVectorize(
  "{embedding-provider-name-api}",
  "{embedding-provider-model-name-api}",
  SimilarityMetric.SIMILARITY_METRIC,
  MODEL_DIMENSIONS,
  new string[]
  {
    "providerKey",
    "API_KEY_NAME",
  },
  new object[] {
    "endpointName",
    "ENDPOINT_NAME",
    "regionName",
    "REGION_NAME",
    "cloudName",
    "CLOUD_NAME"
  }
)]
// end::collection-definition-hugging-face-dedicated-typed[]
// tag::collection-definition-openai-typed[]
[CollectionVectorize(
  "{embedding-provider-name-api}",
  "MODEL_NAME",
  SimilarityMetric.SIMILARITY_METRIC,
  MODEL_DIMENSIONS,
  new string[]
  {
    "providerKey",
    "API_KEY_NAME",
  },
  new object[] {
    "organizationId",
    "ORGANIZATION_ID",
    "projectId",
    "PROJECT_ID"
  }
)]
// end::collection-definition-openai-typed[]
// tag::collection-definition-azure-openai-typed[]
[CollectionVectorize(
  "{embedding-provider-name-api}",
  "MODEL_NAME",
  SimilarityMetric.SIMILARITY_METRIC,
  MODEL_DIMENSIONS,
  new string[]
  {
    "providerKey",
    "API_KEY_NAME",
  },
  new object[] {
    "resourceName",
    "RESOURCE_NAME",
    "deploymentId",
    "DEPLOYMENT_ID"
  }
)]
// end::collection-definition-azure-openai-typed[]
// tag::collection-definition-hosted-provider-typed[]
[CollectionVectorize(
  "{embedding-provider-name-api}",
  "{embedding-provider-model-name-api}",
  SimilarityMetric.Cosine
)]
// end::collection-definition-hosted-provider-typed[]
// tag::type-definition[]
[CollectionName("COLLECTION_NAME")]
public class User
{
  [DocumentId]
  public Guid? Id { get; set; }

  public string Name { get; set; } = null!;

  public int? Age { get; set; }

  [DocumentMapping(DocumentMappingField.Vectorize)]
  public string StringToVectorize => Name;
}

// end::type-definition[]

// tag::pre-collection-definition[]
public class Program
{
  static async Task Main()
  {
    // Instantiate the client
    var client = new DataAPIClient();

    // Connect to a database
    var database = client.GetDatabase(
      "API_ENDPOINT",
      new GetDatabaseOptions()
      {
        Token = "APPLICATION_TOKEN"
      }
    );

    // end::pre-collection-definition[]


    // tag::collection-definition-external-provider[]
    // Define the collection
    var definition = new CollectionDefinition()
    {
      Vector = new VectorOptions()
      {
        Dimension = MODEL_DIMENSIONS,
        Metric = SimilarityMetric.SIMILARITY_METRIC,
        Service = new VectorServiceOptions()
        {
          Provider = "{embedding-provider-name-api}",
          ModelName = "MODEL_NAME",
          Authentication = new Dictionary<string, string>()
          {
            { "providerKey", "API_KEY_NAME" }
          }
        }
      }
    };
    // end::collection-definition-external-provider[]
    // tag::collection-definition-hugging-face-dedicated[]
    // Define the collection
    var definition = new CollectionDefinition()
    {
      Vector = new VectorOptions()
      {
        Dimension = MODEL_DIMENSIONS,
        Metric = SimilarityMetric.SIMILARITY_METRIC,
        Service = new VectorServiceOptions()
        {
          Provider = "{embedding-provider-name-api}",
          ModelName = "{embedding-provider-model-name-api}",
          Authentication = new Dictionary<string, string>()
          {
            { "providerKey", "API_KEY_NAME" }
          },
          Parameters = new Dictionary<string, object>()
          {
            { "endpointName", "ENDPOINT_NAME" },
            { "regionName", "REGION_NAME" },
            { "cloudName", "CLOUD_NAME" }
          },
        }
      }
    };
    // end::collection-definition-hugging-face-dedicated[]
    // tag::collection-definition-openai[]
    // Define the collection
    var definition = new CollectionDefinition()
    {
      Vector = new VectorOptions()
      {
        Dimension = MODEL_DIMENSIONS,
        Metric = SimilarityMetric.SIMILARITY_METRIC,
        Service = new VectorServiceOptions()
        {
          Provider = "{embedding-provider-name-api}",
          ModelName = "MODEL_NAME",
          Authentication = new Dictionary<string, string>()
          {
            { "providerKey", "API_KEY_NAME" }
          },
          Parameters = new Dictionary<string, object>()
          {
            { "organizationId", "ORGANIZATION_ID" },
            { "projectId", "PROJECT_ID" }
          },
        }
      }
    };
    // end::collection-definition-openai[]
    // tag::collection-definition-azure-openai[]
    // Define the collection
    var definition = new CollectionDefinition()
    {
      Vector = new VectorOptions()
      {
        Dimension = MODEL_DIMENSIONS,
        Metric = SimilarityMetric.SIMILARITY_METRIC,
        Service = new VectorServiceOptions()
        {
          Provider = "{embedding-provider-name-api}",
          ModelName = "MODEL_NAME",
          Authentication = new Dictionary<string, string>()
          {
            { "providerKey", "API_KEY_NAME" }
          },
          Parameters = new Dictionary<string, object>()
          {
            { "resourceName", "RESOURCE_NAME" },
            { "deploymentId", "DEPLOYMENT_ID" }
          },
        }
      }
    };
    // end::collection-definition-azure-openai[]
    // tag::collection-definition-hosted-provider[]
    // Define the collection
    var definition = new CollectionDefinition()
    {
      Vector = new VectorOptions()
      {
        Metric = SimilarityMetric.Cosine,
        Service = new VectorServiceOptions()
        {
          Provider = "{embedding-provider-name-api}",
          ModelName = "{embedding-provider-model-name-api}",
        }
      }
    };
    // end::collection-definition-hosted-provider[]
    // tag::post-collection-definition-untyped[]

    // Create the collection
    var collection = await database.CreateCollectionAsync("COLLECTION_NAME", definition);
  }
}
    // end::post-collection-definition-untyped[]
    // tag::post-collection-definition-typed[]
    // Create the collection
    var collection = await database.CreateCollectionAsync<User>();
  }
}
  // end::post-collection-definition-typed[]
