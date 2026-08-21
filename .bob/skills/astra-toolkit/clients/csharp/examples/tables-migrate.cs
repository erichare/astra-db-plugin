using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Core;
using DataStax.AstraDB.DataApi.Core.Enumeration;
using DataStax.AstraDB.DataApi.Core.Query;
using DataStax.AstraDB.DataApi.Tables;

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

    var table = database.GetTable("**TABLE_NAME**");

    string? pageState = null;
    int migratedCount = 0;

    // Use an empty filter to migrate all rows
    var filterBuilder = Builders<Row>.TableFilter;
    var filter = filterBuilder.Empty();

    // You must include ALL primary key columns for your table
    var primaryKeyColumns = new List<string>
    {
      "**PRIMARY_KEY_1**",
      "**PRIMARY_KEY_2**",
    };

    var originalTextColumn = "**NAME_OF_ORIGINAL_TEXT_COLUMN**";
    var newVectorColumn = "**NAME_OF_NEW_VECTOR_COLUMN**";

    // The projection should include ALL primary key columns
    // and the column that stores the original text
    var projectionBuilder = Builders<Row>.Projection;
    var projection = projectionBuilder.Include(primaryKeyColumns[0]);
    foreach (var column in primaryKeyColumns.Skip(1))
    {
      projection = projection.Include(column);
    }
    projection = projection.Include(originalTextColumn);

    while (true)
    {
      TableFindCursor<Row> cursor;
      if (pageState != null)
      {
        cursor = table.Find(
          filter,
          new TableFindOptions<Row>()
          {
            InitialPageState = pageState,
            Projection = projection,
          }
        );
      }
      else
      {
        cursor = table.Find(
          filter,
          new TableFindOptions<Row>() { Projection = projection }
        );
      }

      var page = await cursor.FetchNextPageAsync();
      var rows = page.Results;
      pageState = page.NextPageState;

      if (rows.Count == 0)
      {
        Console.WriteLine("No more rows. Migration complete.");
        break;
      }

      // Build the updates
      var updatedRows = new List<Row>();
      foreach (var row in rows)
      {
        if (
          row.TryGetValue(originalTextColumn, out var textValue)
          && textValue != null
        )
        {
          var updatedRow = new Row();

          // Include the full primary key
          foreach (var column in primaryKeyColumns)
          {
            if (row.TryGetValue(column, out var pkValue))
            {
              updatedRow[column] = pkValue;
            }
          }

          // Set the new vector column to the original text
          updatedRow[newVectorColumn] = textValue;

          updatedRows.Add(updatedRow);
        }
      }

      // Inserting a row with a primary key that already exists in the table will
      // overwrite the specified column but leave unspecified columns unchanged.
      await table.InsertManyAsync(updatedRows);
      migratedCount += updatedRows.Count;

      Console.WriteLine(
        $"Migrated {migratedCount} rows. Page state: {pageState}"
      );

      if (pageState == null)
      {
        Console.WriteLine("Reached final page. Migration complete.");
        break;
      }
    }
  }
}
