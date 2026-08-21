using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Admin;
using DataStax.AstraDB.DataApi.Collections;
using DataStax.AstraDB.DataApi.Core;
using DataStax.AstraDB.DataApi.Core.Query;

namespace Examples;

public class Program
{
  static async Task Main()
  {
    // Specifies the token and timeouts
    var clientOptions = new CommandOptions()
    {
      Token = "**APPLICATION_TOKEN**",
      TimeoutOptions = new TimeoutOptions()
      {
        ConnectionTimeout = TimeSpan.FromMilliseconds(3000),
        RequestTimeout = TimeSpan.FromMilliseconds(9000),
      },
    };
    var client = new DataAPIClient(clientOptions);

    // Overrides the token that was passed to the client
    // and specifies the keyspace
    var databaseOptions = new GetDatabaseOptions()
    {
      Token = "**APPLICATION_TOKEN**",
      Keyspace = "**KEYSPACE_NAME**",
    };
    var database = client.GetDatabase(
      "**API_ENDPOINT**",
      databaseOptions
    );

    // Overrides the keyspace that was passed to the database
    var collectionOptions = new GetCollectionOptions()
    {
      Keyspace = "**KEYSPACE_NAME**",
    };
    var collection = database.GetCollection(
      "**COLLECTION_NAME**",
      collectionOptions
    );

    // Overrides a timeout that was passed to the client
    var methodOptions = new CollectionFindOneOptions<Document>()
    {
      TimeoutOptions = new TimeoutOptions()
      {
        RequestTimeout = TimeSpan.FromMilliseconds(4000),
      },
    };
    var result = await collection.FindOneAsync(methodOptions);
  }
}
