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

    // Use date in an insertion
    var document = new Document()
    {
      { "registered_at", new DateTime(2020, 1, 1, 1, 1, 0) },
      { "hire_date", new DateOnly(2020, 1, 1) },
      { "shift_start", new TimeOnly(9, 15) },
    };

    await collection.InsertOneAsync(document);

    // Use date in a filter
    var filterBuilder = Builders<Document>.CollectionFilter;
    var filter = filterBuilder.And(
      filterBuilder.Eq(
        "registered_at",
        new DateTime(2020, 1, 1, 1, 1, 0)
      ),
      filterBuilder.Lt("hire_date", new DateOnly(2022, 11, 4))
    );

    await collection.FindOneAsync(filter);

    // Use date in an update
    var update = Builders<Document>
      .CollectionUpdate.Set("shift_start", new TimeOnly(10, 30))
      .Set("registered_at", new DateTime(2020, 3, 5, 1, 1, 0));

    await collection.UpdateOneAsync(filter, update);
  }
}
