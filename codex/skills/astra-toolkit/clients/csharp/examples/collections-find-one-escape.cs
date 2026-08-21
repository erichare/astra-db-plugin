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

    // Find documents
    var filterBuilder = Builders<Document>.CollectionFilter;
    var filter = filterBuilder.And(
      filterBuilder.Eq("areas.r&&d", false),
      filterBuilder.Lt("costs.price&.usd", 300)
    );

    var findOptions = new CollectionFindOneOptions<Document>()
    {
      Sort = Builders<Document>.CollectionSort.Ascending(
        "costs.price&.usd"
      ),
      Projection = Builders<Document>
        .Projection.Include("areas.r&&d")
        .Include("costs.price&.cad"),
    };

    var result = await collection.FindOneAsync(filter, findOptions);

    Console.WriteLine(JsonSerializer.Serialize(result));
  }
}

// ==============  BOUNDARY BETWEEN EXAMPLE SNIPPETS  ==============

using System.Text.Json;
using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Collections;
using DataStax.AstraDB.DataApi.Core;
using DataStax.AstraDB.DataApi.Core.Query;
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

    // Find documents
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

    var findOptions = new CollectionFindOneOptions<Document>()
    {
      Sort = Builders<Document>.CollectionSort.Ascending(
        FieldEscaping.EscapeFieldNames("costs", "price.usd")
      ),
      Projection = Builders<Document>
        .Projection.Include(
          FieldEscaping.EscapeFieldNames("areas", "r&d")
        )
        .Include(FieldEscaping.EscapeFieldNames("costs", "price.cad")),
    };

    var result = await collection.FindOneAsync(filter, findOptions);

    Console.WriteLine(JsonSerializer.Serialize(result));
  }
}
