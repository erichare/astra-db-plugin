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

    // Delete a document
    var filterBuilder = Builders<Document>.CollectionFilter;
    var filter = filterBuilder.Eq("metadata.language", "English");
    var deleteOptions = new CollectionDeleteOneOptions<Document>()
    {
      Sort = Builders<Document>
        .CollectionSort.Ascending("rating")
        .Descending("title"),
    };
    var result = await collection.DeleteOneAsync(filter, deleteOptions);

    Console.WriteLine(result.DeletedCount);
  }
}
