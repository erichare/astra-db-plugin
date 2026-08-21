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
    var filterBuilder = Builders<Document>.CollectionFilter;
    var filter = filterBuilder.And(
      filterBuilder.Eq("is_checked_out", false),
      filterBuilder.Lt("number_of_pages", 300)
    );
    var replacement = new Document()
    {
      { "is_checked_out", true },
      { "borrower", "Brook Reed" },
    };
    var replaceOptions = new CollectionReplaceOneOptions<Document>()
    {
      Upsert = true,
    };
    var result = await collection.ReplaceOneAsync(
      filter,
      replacement,
      replaceOptions
    );

    Console.WriteLine(result.MatchedCount);
    Console.WriteLine(result.ModifiedCount);
    Console.WriteLine(result.UpsertedId);
  }
}
