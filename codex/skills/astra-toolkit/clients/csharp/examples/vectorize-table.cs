// tag::pre-table-definition[]
using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Core;
using DataStax.AstraDB.DataApi.Tables;
using DataStax.AstraDB.DataApi.Utils;

namespace Examples;

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
// end::pre-table-definition[]

// tag::table-definition-external-provider[]

    // Define the columns and primary key for the table
    var tableDefinition = new TableDefinition()
      // This column will store vector embeddings.
      // The {embedding-provider-name} integration
      // will automatically generate vector embeddings
      // for any text inserted to this column.
      .AddColumn(
        "VECTOR_COLUMN_NAME",
        DataAPIType.Vectorize(
          MODEL_DIMENSIONS,
          new VectorServiceOptions
          {
            Provider = "{embedding-provider-name-api}",
            ModelName = "MODEL_NAME",
            Authentication = new Dictionary<string, string>()
            {
              { "providerKey", "API_KEY_NAME" },
            },
          }
        )
      )
      // If you want to store the original text
      // in addition to the generated embeddings
      // you must create a separate column.
      .AddColumn("TEXT_COLUMN_NAME", DataAPIType.Text())
      // You should change the primary key definition to meet the needs of your data.
      .AddSinglePrimaryKey("TEXT_COLUMN_NAME");
// end::table-definition-external-provider[]

// tag::table-definition-hugging-face-dedicated[]

    // Define the columns and primary key for the table
    var tableDefinition = new TableDefinition()
      // This column will store vector embeddings.
      // The {embedding-provider-name} integration
      // will automatically generate vector embeddings
      // for any text inserted to this column.
      .AddColumn(
        "VECTOR_COLUMN_NAME",
        DataAPIType.Vectorize(
          MODEL_DIMENSIONS,
          new VectorServiceOptions
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
          }
        )
      )
      // If you want to store the original text
      // in addition to the generated embeddings
      // you must create a separate column.
      .AddColumn("TEXT_COLUMN_NAME", DataAPIType.Text())
      // You should change the primary key definition to meet the needs of your data.
      .AddSinglePrimaryKey("TEXT_COLUMN_NAME");
// end::table-definition-hugging-face-dedicated[]

// tag::table-definition-openai[]

    // Define the columns and primary key for the table
    var tableDefinition = new TableDefinition()
      // This column will store vector embeddings.
      // The {embedding-provider-name} integration
      // will automatically generate vector embeddings
      // for any text inserted to this column.
      .AddColumn(
        "VECTOR_COLUMN_NAME",
        DataAPIType.Vectorize(
          MODEL_DIMENSIONS,
          new VectorServiceOptions
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
          }
        )
      )
      // If you want to store the original text
      // in addition to the generated embeddings
      // you must create a separate column.
      .AddColumn("TEXT_COLUMN_NAME", DataAPIType.Text())
      // You should change the primary key definition to meet the needs of your data.
      .AddSinglePrimaryKey("TEXT_COLUMN_NAME");
// end::table-definition-openai[]

// tag::table-definition-azure-openai[]

    // Define the columns and primary key for the table
    var tableDefinition = new TableDefinition()
      // This column will store vector embeddings.
      // The {embedding-provider-name} integration
      // will automatically generate vector embeddings
      // for any text inserted to this column.
      .AddColumn(
        "VECTOR_COLUMN_NAME",
        DataAPIType.Vectorize(
          MODEL_DIMENSIONS,
          new VectorServiceOptions
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
          }
        )
      )
      // If you want to store the original text
      // in addition to the generated embeddings
      // you must create a separate column.
      .AddColumn("TEXT_COLUMN_NAME", DataAPIType.Text())
      // You should change the primary key definition to meet the needs of your data.
      .AddSinglePrimaryKey("TEXT_COLUMN_NAME");
// end::table-definition-azure-openai[]

// tag::table-definition-hosted-provider[]

    // Define the columns and primary key for the table
    var tableDefinition = new TableDefinition()
      // This column will store vector embeddings.
      // The {embedding-provider-name} integration
      // will automatically generate vector embeddings
      // for any text inserted to this column.
      .AddColumn(
        "VECTOR_COLUMN_NAME",
        DataAPIType.Vectorize(
          new VectorServiceOptions
          {
            Provider = "{embedding-provider-name-api}",
            ModelName = "{embedding-provider-model-name-api}",
          }
        )
      )
      // If you want to store the original text
      // in addition to the generated embeddings
      // you must create a separate column.
      .AddColumn("TEXT_COLUMN_NAME", DataAPIType.Text())
      // You should change the primary key definition to meet the needs of your data.
      .AddSinglePrimaryKey("TEXT_COLUMN_NAME");
// end::table-definition-hosted-provider[]

// tag::create-table[]

    // Create the table
    var table = await database.CreateTableAsync(
      "TABLE_NAME",
      tableDefinition
    );
// end::create-table[]

//tag::index-columns-external[]

    // Index the vector column so that you can perform a vector search on it
    await table.CreateVectorIndexAsync(
      "INDEX_NAME",
      "VECTOR_COLUMN_NAME",
      Builders.TableIndex.Vector(SimilarityMetric.SIMILARITY_METRIC)
    );
//end::index-columns-external[]

//tag::index-columns-hosted[]

  // Index the vector column so that you can perform a vector search on it
  await table.CreateVectorIndexAsync(
    "INDEX_NAME",
    "VECTOR_COLUMN_NAME",
    Builders.TableIndex.Vector(SimilarityMetric.Cosine)
  );
//end::index-columns-hosted[]

//tag::closing[]
  }
}
//end::closing[]
