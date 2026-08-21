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
    // Instantiate the client
    var client = new DataAPIClient();

    // Connect to a database
    var database = client.GetDatabase(
      "**API_ENDPOINT**",
      "**APPLICATION_TOKEN**"
    );

    // Get an existing collection
    var collection = database.GetCollection("**COLLECTION_NAME**");

    // Use vector search and filters to find a document
    var filterBuilder = Builders<Document>.CollectionFilter;
    var filter = filterBuilder.And(
      filterBuilder.Eq("is_checked_out", false),
      filterBuilder.Lt("number_of_pages", 300)
    );

    var findOptions = new CollectionFindOneOptions<Document>()
    {
      Sort = Builders<Document>.CollectionSort.Vectorize(
        "A thrilling story set in a futuristic world"
      ),
    };

    var result = await collection.FindOneAsync(filter, findOptions);

    Console.WriteLine(JsonSerializer.Serialize(result));
  }
}
