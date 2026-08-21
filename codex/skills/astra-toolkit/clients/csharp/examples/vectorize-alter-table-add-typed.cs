// tag::pre-table-definition[]
using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Core;
using DataStax.AstraDB.DataApi.Tables;

namespace Examples;

public abstract class ExampleRowBeforeAlter
{
  [ColumnPrimaryKey(1)]
  [ColumnName("title")]
  public string Title { get; set; } = null!;

  [ColumnPrimaryKey(2)]
  [ColumnName("author")]
  public string Author { get; set; } = null!;
}

public class ExampleRowAfterAlter : ExampleRowBeforeAlter
{
  [ColumnName("example_vectorize")]
  public object? ExampleVectorize { get; set; }

  [ColumnName("example_original_text")]
  public string? ExampleOriginalText { get; set; }
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
    // Add a vector column and configure an embedding provider
    await table.AlterAsync(
      new AlterTableAddVectorColumns(
        new Dictionary<string, AlterTableVectorColumnDefinition>
        {
          // This column will store vector embeddings.
          // The {embedding-provider-name} integration
          // will automatically generate vector embeddings
          // for any text inserted to this column.
          ["VECTOR_COLUMN_NAME"] = new AlterTableVectorColumnDefinition
          {
            VectorDimension = MODEL_DIMENSIONS,
            Service = new VectorServiceOptions
            {
              Provider = "{embedding-provider-name-api}",
              ModelName = "MODEL_NAME",
              Authentication = new Dictionary<string, string>()
              {
                  { "providerKey", "API_KEY_NAME" },
              },
            },
          },
        }
      )
    );
    // end::table-definition-external-provider[]

    // tag::table-definition-hugging-face-dedicated[]
    // Add a vector column and configure an embedding provider
    await table.AlterAsync(
      new AlterTableAddVectorColumns(
        new Dictionary<string, AlterTableVectorColumnDefinition>
        {
          // This column will store vector embeddings.
          // The {embedding-provider-name} integration
          // will automatically generate vector embeddings
          // for any text inserted to this column.
          ["VECTOR_COLUMN_NAME"] = new AlterTableVectorColumnDefinition
          {
            VectorDimension = MODEL_DIMENSIONS,
            Service = new VectorServiceOptions
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
          },
        }
      )
    );
    // end::table-definition-hugging-face-dedicated[]

    // tag::table-definition-openai[]
    // Add a vector column and configure an embedding provider
    await table.AlterAsync(
      new AlterTableAddVectorColumns(
        new Dictionary<string, AlterTableVectorColumnDefinition>
        {
          // This column will store vector embeddings.
          // The {embedding-provider-name} integration
          // will automatically generate vector embeddings
          // for any text inserted to this column.
          ["VECTOR_COLUMN_NAME"] = new AlterTableVectorColumnDefinition
          {
            VectorDimension = MODEL_DIMENSIONS,
            Service = new VectorServiceOptions
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
          },
        }
      )
    );
    // end::table-definition-openai[]

    // tag::table-definition-azure-openai[]
    // Add a vector column and configure an embedding provider
    await table.AlterAsync(
      new AlterTableAddVectorColumns(
        new Dictionary<string, AlterTableVectorColumnDefinition>
        {
          // This column will store vector embeddings.
          // The {embedding-provider-name} integration
          // will automatically generate vector embeddings
          // for any text inserted to this column.
          ["VECTOR_COLUMN_NAME"] = new AlterTableVectorColumnDefinition
          {
            VectorDimension = MODEL_DIMENSIONS,
            Service = new VectorServiceOptions
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
          },
        }
      )
    );
    // end::table-definition-azure-openai[]

    // tag::table-definition-hosted-provider[]
    // Add a vector column and configure an embedding provider
    await table.AlterAsync(
      new AlterTableAddVectorColumns(
        new Dictionary<string, AlterTableVectorColumnDefinition>
        {
          // This column will store vector embeddings.
          // The {embedding-provider-name} integration
          // will automatically generate vector embeddings
          // for any text inserted to this column.
          ["VECTOR_COLUMN_NAME"] = new AlterTableVectorColumnDefinition
          {
            Service = new VectorServiceOptions
            {
              Provider = "{embedding-provider-name-api}",
              ModelName = "{embedding-provider-model-name-api}",
            },
          },
        }
      )
    );
    // end::table-definition-hosted-provider[]

  //tag::closing[]

    // If you want to store the original text
    // in addition to the generated embeddings
    // you must create a separate column.
    var alteredTable = await table.AlterAsync<ExampleRowAfterAlter>(
      new AlterTableAddColumns(
        new Dictionary<string, AlterTableColumnDefinition>
        {
          ["TEXT_COLUMN_NAME"] = new AlterTableColumnDefinition
          {
            Type = "text",
          },
        }
      )
    );
  }
}
//end::closing[]
