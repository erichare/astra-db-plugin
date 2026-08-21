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
    var embeddings = new float[] { 0.08f, -0.62f, 0.39f };
    var updateOptions = new CollectionUpdateOneOptions<Document>()
    {
      Sort = Builders<Document>.CollectionSort.Vector(embeddings),
    };
    var update = Builders<Document>.CollectionUpdate.Set("color", "blue");
    var result = await collection.UpdateOneAsync(
      null,
      update,
      updateOptions
    );

    Console.WriteLine(result.MatchedCount);
    Console.WriteLine(result.ModifiedCount);
  }
}
