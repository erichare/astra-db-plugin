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

  [DocumentMapping(DocumentMappingField.Vectorize)]
  public string StringToVectorize => Name;
}

public class Program
{
  static void Main()
  {
    // Get a database
    var client = new DataAPIClient();
    var database = client.GetDatabase(
      "**API_ENDPOINT**",
      "**APPLICATION_TOKEN**"
    );

    // Get a collection
    var collection = database.GetCollection<User>();
  }
}
