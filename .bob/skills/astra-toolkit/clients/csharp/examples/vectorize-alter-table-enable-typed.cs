// tag::pre-table-definition[]
using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Core;
using DataStax.AstraDB.DataApi.Tables;

namespace Examples;

public abstract class ExampleRowBase
{
  [ColumnPrimaryKey(1)]
  [ColumnName("title")]
  public string Title { get; set; } = null!;

  [ColumnPrimaryKey(2)]
  [ColumnName("author")]
  public string Author { get; set; } = null!;
}

public class ExampleRowBeforeAlter : ExampleRowBase
{
  [ColumnName("example_vector")]
  public object? ExampleVector { get; set; }
}

public class ExampleRowAfterAlter : ExampleRowBase
{
  [ColumnName("example_vector")]
  public float[]? ExampleVector { get; set; }
}

public class Program
{
  static async Task Main()
  {
    // Get an existing table
    var client = new DataAPIClient();
    var database = client.GetDatabase(
      "API_ENDPOINT",
      "APPLICATION_TOKEN"
    );
    var table = database.GetTable<ExampleRowBeforeAlter>("TABLE_NAME");

    // end::pre-table-definition[]

    // tag::table-definition-external-provider[]

    // Configure an embedding provider for a column
    var alteredTable = await table.AlterAsync<ExampleRowAfterAlter>(
      new AlterTableAddVectorize(
        new Dictionary<string, VectorServiceOptions>
        {
          ["VECTOR_COLUMN_NAME"] = new VectorServiceOptions
          {
            Provider = "{embedding-provider-name-api}",
            ModelName = "MODEL_NAME",
            Authentication = new Dictionary<string, string>()
            {
              { "providerKey", "API_KEY_NAME" },
            },
          },
        }
      )
    );
    // end::table-definition-external-provider[]

    // tag::table-definition-hugging-face-dedicated[]

    // Configure an embedding provider for a column
    var alteredTable = await table.AlterAsync<ExampleRowAfterAlter>(
      new AlterTableAddVectorize(
        new Dictionary<string, VectorServiceOptions>
        {
          ["VECTOR_COLUMN_NAME"] = new VectorServiceOptions
          {
            Provider = "{embedding-provider-name-api}",
            ModelName = "{embedding-provider-model-name-api}",
            Authentication = new Dictionary<string, string>()
            {
              { "providerKey", "API_KEY_NAME" },
            },
            Parameters = new Dictionary<string, object>()
            {
              { "endpointName", "ENDPOINT_NAME" },
              { "regionName", "REGION_NAME" },
              { "cloudName", "CLOUD_NAME" },
            },
          },
        }
      )
    );
    // end::table-definition-hugging-face-dedicated[]

    // tag::table-definition-openai[]

    // Configure an embedding provider for a column
    var alteredTable = await table.AlterAsync<ExampleRowAfterAlter>(
      new AlterTableAddVectorize(
        new Dictionary<string, VectorServiceOptions>
        {
          ["VECTOR_COLUMN_NAME"] = new VectorServiceOptions
          {
            Provider = "{embedding-provider-name-api}",
            ModelName = "MODEL_NAME",
            Authentication = new Dictionary<string, string>()
            {
              { "providerKey", "API_KEY_NAME" },
            },
            Parameters = new Dictionary<string, object>()
            {
              { "organizationId", "ORGANIZATION_ID" },
              { "projectId", "PROJECT_ID" },
            },
          },
        }
      )
    );
    // end::table-definition-openai[]

    // tag::table-definition-azure-openai[]

    // Configure an embedding provider for a column
    var alteredTable = await table.AlterAsync<ExampleRowAfterAlter>(
      new AlterTableAddVectorize(
        new Dictionary<string, VectorServiceOptions>
        {
          ["VECTOR_COLUMN_NAME"] = new VectorServiceOptions
          {
            Provider = "{embedding-provider-name-api}",
            ModelName = "MODEL_NAME",
            Authentication = new Dictionary<string, string>()
            {
              { "providerKey", "API_KEY_NAME" },
            },
            Parameters = new Dictionary<string, object>()
            {
              { "resourceName", "RESOURCE_NAME" },
              { "deploymentId", "DEPLOYMENT_ID" },
            },
          },
        }
      )
    );
    // end::table-definition-azure-openai[]

    // tag::table-definition-hosted-provider[]

    // Configure an embedding provider for a column
    var alteredTable = await table.AlterAsync<ExampleRowAfterAlter>(
      new AlterTableAddVectorize(
        new Dictionary<string, VectorServiceOptions>
        {
          ["VECTOR_COLUMN_NAME"] = new VectorServiceOptions
          {
            Provider = "{embedding-provider-name-api}",
            ModelName = "{embedding-provider-model-name-api}",
          },
        }
      )
    );
    // end::table-definition-hosted-provider[]

    //tag::closing[]
  }
}
//end::closing[]
