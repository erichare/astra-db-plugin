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

    // Find a document
    var filterBuilder = Builders<Document>.CollectionFilter;
    var filter = filterBuilder.And(
      filterBuilder.Eq("is_checked_out", false),
      filterBuilder.Lt("number_of_pages", 300)
    );

    var findOptions = new CollectionFindOneOptions<Document>()
    {
      Sort = Builders<Document>
        .CollectionSort.Ascending("rating")
        .Descending("title"),
      Projection = Builders<Document>
        .Projection.Include("is_checked_out")
        .Include("title"),
    };

    var result = await collection.FindOneAsync(filter, findOptions);

    Console.WriteLine(JsonSerializer.Serialize(result));
  }
}
