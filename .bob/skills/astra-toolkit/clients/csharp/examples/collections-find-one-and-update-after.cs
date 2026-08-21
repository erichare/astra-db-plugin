using System.Text.Json;
using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Collections;
using DataStax.AstraDB.DataApi.Core;
using DataStax.AstraDB.DataApi.Core.Query;

namespace Examples;

public class Program
{
  static async Task Main()
  {
    // Get an existing collection
    var client = new DataAPIClient();
    var database = client.GetDatabase(
      "**API_ENDPOINT**",
      "**APPLICATION_TOKEN**"
    );
    var collection = database.GetCollection("**COLLECTION_NAME**");

    // Update a document
    var filterBuilder = Builders<Document>.CollectionFilter;
    var filter = filterBuilder.Eq("_id", "101");
    var update = Builders<Document>.CollectionUpdate.Set("color", "blue");
    var updateOptions = new CollectionFindOneAndUpdateOptions<Document>()
    {
      ReturnDocument = ReturnDocumentDirective.After,
    };
    var result = await collection.FindOneAndUpdateAsync(
      filter,
      update,
      updateOptions
    );

    Console.WriteLine(JsonSerializer.Serialize(result));
  }
}
