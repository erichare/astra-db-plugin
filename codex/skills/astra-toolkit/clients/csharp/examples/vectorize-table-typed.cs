// tag::pre-row-class[]
using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Tables;

namespace Examples;

// end::pre-row-class[]

// tag::row-class-external-provider[]
[TableName("TABLE_NAME")]
public class ExampleRow
{
  // This column will store vector embeddings.
  // The {embedding-provider-name} integration
  // will automatically generate vector embeddings
  // for any text inserted to this column.
  [ColumnVectorize(
    provider: "{embedding-provider-name-api}",
    modelName: "MODEL_NAME",
    dimension: MODEL_DIMENSIONS,
    authenticationPairs: new string[]
    {
      "providerKey", "API_KEY_NAME",
    }
  )]
  [ColumnName("VECTOR_COLUMN_NAME")]
  public object? ExampleVectorize { get; set; }

  // If you want to store the original text
  // in addition to the generated embeddings
  // you must create a separate column.
  // You should change the primary key definition to meet the needs of your data.
  [ColumnPrimaryKey(1)]
  [ColumnName("TEXT_COLUMN_NAME")]
  public string ExampleOriginalString { get; set; } = null!;
}
// end::row-class-external-provider[]

// tag::row-class-hugging-face-dedicated[]
[TableName("TABLE_NAME")]
public class ExampleRow
{
  // This column will store vector embeddings.
  // The {embedding-provider-name} integration
  // will automatically generate vector embeddings
  // for any text inserted to this column.
  [ColumnVectorize(
    provider: "{embedding-provider-name-api}",
    modelName: "{embedding-provider-model-name-api}",
    dimension: MODEL_DIMENSIONS,
    authenticationPairs: new string[]
    {
      "providerKey", "API_KEY_NAME",
    },
    parameterPairs: new object[]
    {
      "endpointName",
      "ENDPOINT_NAME",
      "regionName",
      "REGION_NAME",
      "cloudName",
      "CLOUD_NAME",
    }
  )]
  [ColumnName("VECTOR_COLUMN_NAME")]
  public object? ExampleVectorize { get; set; }

  // If you want to store the original text
  // in addition to the generated embeddings
  // you must create a separate column.
  // You should change the primary key definition to meet the needs of your data.
  [ColumnPrimaryKey(1)]
  [ColumnName("TEXT_COLUMN_NAME")]
  public string ExampleOriginalString { get; set; } = null!;
}
// end::row-class-hugging-face-dedicated[]

// tag::row-class-openai[]
[TableName("TABLE_NAME")]
public class ExampleRow
{
  // This column will store vector embeddings.
  // The {embedding-provider-name} integration
  // will automatically generate vector embeddings
  // for any text inserted to this column.
  [ColumnVectorize(
    provider: "{embedding-provider-name-api}",
    modelName: "MODEL_NAME",
    dimension: MODEL_DIMENSIONS,
    authenticationPairs: new string[]
    {
      "providerKey", "API_KEY_NAME",
    },
    parameterPairs: new object[]
    {
      "organizationId",
      "ORGANIZATION_ID",
      "projectId",
      "PROJECT_ID",
    }
  )]
  [ColumnName("VECTOR_COLUMN_NAME")]
  public object? ExampleVectorize { get; set; }

  // If you want to store the original text
  // in addition to the generated embeddings
  // you must create a separate column.
  // You should change the primary key definition to meet the needs of your data.
  [ColumnPrimaryKey(1)]
  [ColumnName("TEXT_COLUMN_NAME")]
  public string ExampleOriginalString { get; set; } = null!;
}
// end::row-class-openai[]

// tag::row-class-azure-openai[]
[TableName("TABLE_NAME")]
public class ExampleRow
{
  // This column will store vector embeddings.
  // The {embedding-provider-name} integration
  // will automatically generate vector embeddings
  // for any text inserted to this column.
  [ColumnVectorize(
    provider: "{embedding-provider-name-api}",
    modelName: "MODEL_NAME",
    dimension: MODEL_DIMENSIONS,
    authenticationPairs: new string[]
    {
      "providerKey", "API_KEY_NAME",
    },
    parameterPairs: new object[]
    {
      "resourceName",
      "RESOURCE_NAME",
      "deploymentId",
      "DEPLOYMENT_ID",
    }
  )]
  [ColumnName("VECTOR_COLUMN_NAME")]
  public object? ExampleVectorize { get; set; }

  // If you want to store the original text
  // in addition to the generated embeddings
  // you must create a separate column.
  // You should change the primary key definition to meet the needs of your data.
  [ColumnPrimaryKey(1)]
  [ColumnName("TEXT_COLUMN_NAME")]
  public string ExampleOriginalString { get; set; } = null!;
}
// end::row-class-azure-openai[]

// tag::row-class-hosted-provider[]
[TableName("TABLE_NAME")]
public class ExampleRow
{
  // This column will store vector embeddings.
  // The {embedding-provider-name} integration
  // will automatically generate vector embeddings
  // for any text inserted to this column.
  [ColumnVectorize(
    provider: "{embedding-provider-name-api}",
    modelName: "{embedding-provider-model-name-api}"
  )]
  [ColumnName("VECTOR_COLUMN_NAME")]
  public object? ExampleVectorize { get; set; }

  // If you want to store the original text
  // in addition to the generated embeddings
  // you must create a separate column.
  // You should change the primary key definition to meet the needs of your data.
  [ColumnPrimaryKey(1)]
  [ColumnName("TEXT_COLUMN_NAME")]
  public string ExampleOriginalString { get; set; } = null!;
}
// end::row-class-hosted-provider[]

// tag::post-row-class[]
public class Program
{
  static async Task Main()
  {
    // Instantiate the client
    var client = new DataAPIClient();

    // Connect to a database
    var database = client.GetDatabase(
      "API_ENDPOINT",
      "APPLICATION_TOKEN"
    );

    // Create a table
    var table = await database.CreateTableAsync<ExampleRow>();
  }
}
// end::post-row-class[]
