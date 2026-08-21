using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Collections;
using DataStax.AstraDB.DataApi.Core;
using DataStax.AstraDB.DataApi.Core.Enumeration;
using DataStax.AstraDB.DataApi.Core.Query;

namespace Examples;

public class Program
{
  static async Task Main()
  {
    var client = new DataAPIClient();
    var database = client.GetDatabase(
      "**API_ENDPOINT**",
      "**APPLICATION_TOKEN**"
    );

    var oldCollection = database.GetCollection("**OLD_COLLECTION_NAME**");
    var newCollection = database.GetCollection("**NEW_COLLECTION_NAME**");

    string? pageState = null;
    int migratedCount = 0;

    // Use an empty filter to migrate all documents
    var filterBuilder = Builders<Document>.CollectionFilter;
    var filter = filterBuilder.Empty();

    // You must explicitly include $vectorize.
    // $vector is excluded by default.
    // _id and any other fields that don't start with $ are included by default.
    var projection = Builders<Document>.Projection.Include("$vectorize");

    while (true)
    {
      CollectionFindCursor<Document> cursor;
      if (pageState != null)
      {
        cursor = oldCollection.Find(
          filter,
          new CollectionFindOptions<Document>()
          {
            InitialPageState = pageState,
            Projection = projection,
          }
        );
      }
      else
      {
        cursor = oldCollection.Find(
          filter,
          new CollectionFindOptions<Document>()
          {
            Projection = projection,
          }
        );
      }

      var page = await cursor.FetchNextPageAsync();
      var documents = page.Results;
      pageState = page.NextPageState;

      if (documents.Count == 0)
      {
        Console.WriteLine("No more documents. Migration complete.");
        break;
      }

      // Insert the documents to the new collection.
      // _id and the other field values (excluding $vector) will be the same.
      // $vector will automatically be generated based on the value $vectorize.
      await newCollection.InsertManyAsync(documents);

      migratedCount += documents.Count;

      Console.WriteLine(
        $"Migrated {migratedCount} documents. Page state: {pageState}"
      );

      if (pageState == null)
      {
        Console.WriteLine("Reached final page. Migration complete.");
        break;
      }
    }
  }
}
