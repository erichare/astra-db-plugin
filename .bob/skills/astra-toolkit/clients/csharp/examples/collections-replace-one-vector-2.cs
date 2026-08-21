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
    var filter = Builders<Document>.CollectionFilter.Eq("_id", "101");
    var embeddings = new double[] { 0.08f, -0.62f, 0.39f };
    var replacement = new Document()
    {
      { "$vector", embeddings },
      { "name", "Jane Doe" },
    };
    var result = await collection.ReplaceOneAsync(filter, replacement);

    Console.WriteLine(result.MatchedCount);
    Console.WriteLine(result.ModifiedCount);
  }
}
