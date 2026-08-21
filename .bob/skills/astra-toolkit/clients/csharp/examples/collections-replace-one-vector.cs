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

    // Replace a document
    var embeddings = new float[] { 0.08f, -0.62f, 0.39f };
    var replaceOptions = new CollectionReplaceOneOptions<Document>()
    {
      Sort = Builders<Document>.CollectionSort.Vector(embeddings),
    };
    var replacement = new Document()
    {
      { "name", "Jane Doe" },
      { "age", 42 },
    };
    var result = await collection.ReplaceOneAsync(
      null,
      replacement,
      replaceOptions
    );

    Console.WriteLine(result.MatchedCount);
    Console.WriteLine(result.ModifiedCount);
  }
}
