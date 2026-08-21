using System.Text.Json;
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
      filterBuilder.Eq("areas.r&&d", false),
      filterBuilder.Lt("costs.price&.usd", 300)
    );
    var updater = Builders<Document>.CollectionUpdate;
    var update = updater
      .Set("areas.r&&d", true)
      .Set("costs.price&.usd", 310);
    var result = await collection.FindOneAndUpdateAsync(filter, update);

    Console.WriteLine(JsonSerializer.Serialize(result));
  }
}

// ==============  BOUNDARY BETWEEN EXAMPLE SNIPPETS  ==============

using System.Text.Json;
using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Collections;
using DataStax.AstraDB.DataApi.Core;
using DataStax.AstraDB.DataApi.Utils;

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
      filterBuilder.Eq(
        FieldEscaping.EscapeFieldNames("areas", "r&d"),
        false
      ),
      filterBuilder.Lt(
        FieldEscaping.EscapeFieldNames("costs", "price.usd"),
        300
      )
    );
    var updater = Builders<Document>.CollectionUpdate;
    var update = updater
      .Set(FieldEscaping.EscapeFieldNames("areas", "r&d"), true)
      .Set(FieldEscaping.EscapeFieldNames("costs", "price.usd"), 310);
    var result = await collection.FindOneAndUpdateAsync(filter, update);

    Console.WriteLine(JsonSerializer.Serialize(result));
  }
}
