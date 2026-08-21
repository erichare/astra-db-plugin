// tag::pre-table-definition[]
using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Core;
using DataStax.AstraDB.DataApi.Tables;

namespace Examples;

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
    var table = database.GetTable("TABLE_NAME");

    // end::pre-table-definition[]

    // tag::table-definition-external-provider[]

    // Configure an embedding provider for a column
    await table.AlterAsync(
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
    await table.AlterAsync(
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
    await table.AlterAsync(
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
    await table.AlterAsync(
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
    await table.AlterAsync(
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
