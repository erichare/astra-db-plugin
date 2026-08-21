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

    // Replace a document
    var filterBuilder = Builders<Document>.CollectionFilter;
    var filter = filterBuilder.And(
      filterBuilder.Eq("areas.r&&d", false),
      filterBuilder.Lt("costs.price&.usd", 300)
    );

    var replacement = new Document()
    {
      {
        "areas",
        new Document { { "r&d", false }, { "design", true } }
      },
      {
        "costs",
        new Document { { "price.usd", 100 }, { "price.cad", 90 } }
      },
    };

    var replaceOptions =
      new CollectionFindOneAndReplaceOptions<Document>()
      {
        Projection = Builders<Document>
          .Projection.Include("areas.r&&d")
          .Include("costs.price&.usd"),
        Sort = Builders<Document>
          .CollectionSort.Ascending("areas.r&&d")
          .Descending("costs.price&.usd"),
      };

    var result = await collection.FindOneAndReplaceAsync(
      filter,
      replacement,
      replaceOptions
    );

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

    // Find a document
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

    var options = new CollectionFindOneAndReplaceOptions<Document>()
    {
      Sort = Builders<Document>
        .CollectionSort.Ascending(
          FieldEscaping.EscapeFieldNames("areas", "r&d")
        )
        .Descending(FieldEscaping.EscapeFieldNames("costs", "price.usd")),
      Projection = Builders<Document>
        .Projection.Include(
          FieldEscaping.EscapeFieldNames("areas", "r&d")
        )
        .Include(FieldEscaping.EscapeFieldNames("costs", "price.usd")),
    };

    var replacement = new Document()
    {
      {
        "areas",
        new Document { { "r&d", false }, { "design", true } }
      },
      {
        "costs",
        new Document { { "price.usd", 100 }, { "price.cad", 90 } }
      },
    };

    var result = await collection.FindOneAndReplaceAsync(
      filter,
      replacement,
      options
    );

    Console.WriteLine(JsonSerializer.Serialize(result));
  }
}
