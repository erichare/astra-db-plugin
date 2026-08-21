using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Collections;
using DataStax.AstraDB.DataApi.SerDes;

namespace Examples;

// Define the type for the collection
[CollectionName("**COLLECTION_NAME**")]
public class User
{
  [DocumentId]
  public Guid? Id { get; set; }

  public string Name { get; set; } = null!;

  public int? Age { get; set; }
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
    var collection = await database.CreateCollectionAsync<User>();
  }
}
