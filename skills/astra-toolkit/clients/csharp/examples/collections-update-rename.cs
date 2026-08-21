using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Collections;
using DataStax.AstraDB.DataApi.Core;

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
    var filter = filterBuilder.And(
      filterBuilder.Eq("title", "Into Shadows of Tomorrow"),
      filterBuilder.Eq("author", "Nicole Wright")
    );

    var update = Builders<Document>
      .CollectionUpdate.Rename("old_field", "new_field")
      .Rename("other_old_field", "other_new_field");

    await collection.UpdateOneAsync(filter, update);
  }
}
