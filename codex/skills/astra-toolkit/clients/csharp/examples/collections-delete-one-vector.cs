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
    var embeddings = new float[] { 0.08f, -0.62f, 0.39f };
    var deleteOptions = new CollectionDeleteOneOptions<Document>()
    {
      Sort = Builders<Document>.CollectionSort.Vector(embeddings),
    };
    var result = await collection.DeleteOneAsync(null, deleteOptions);

    Console.WriteLine(result.DeletedCount);
  }
}
