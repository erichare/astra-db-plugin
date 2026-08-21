import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.core.paging.Page;
import com.datastax.astra.client.core.query.Filter;
import com.datastax.astra.client.core.query.Projection;
import com.datastax.astra.client.databases.Database;
import com.datastax.astra.client.tables.Table;
import com.datastax.astra.client.tables.commands.options.TableFindOptions;
import com.datastax.astra.client.tables.definition.rows.Row;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Stream;

public class Example {

  public static void main(String[] args) {

    Database database = new DataAPIClient("**APPLICATION_TOKEN**").getDatabase("**API_ENDPOINT**");

    Table<Row> table = database.getTable("**TABLE_NAME**");

    String pageState = null;
    int migratedCount = 0;

    // Use an empty filter to find all rows
    Filter filter = null;

    // You must include ALL primary key columns for your table
    String[] primaryKeyColumns = new String[] {"**PRIMARY_KEY_1**", "**PRIMARY_KEY_2**"};

    String originalTextColumn = "**NAME_OF_ORIGINAL_TEXT_COLUMN**";

    String newVectorColumn = "**NAME_OF_NEW_VECTOR_COLUMN**";

    // The projection should include ALL primary key columns
    // and the column that stores the original text
    String[] projectedColumns =
        Stream.concat(Arrays.stream(primaryKeyColumns), Stream.of(originalTextColumn))
            .toArray(String[]::new);

    while (true) {
      Page<Row> page =
          table.findPage(
              filter,
              new TableFindOptions()
                  .projection(Projection.include(projectedColumns))
                  .pageState(pageState));

      List<Row> rows = page.getResults();

      pageState = page.getPageState().orElse(null);

      if (rows == null || rows.isEmpty()) {
        System.out.println("No more rows. Migration complete.");
        break;
      }

      // Build the updates
      List<Row> updatedRows = new ArrayList<>();
      for (Row row : rows) {
        Object text = row.get(originalTextColumn);

        if (text != null) {
          Row updatedRow = new Row();

          // Include the full primary key
          for (String primaryKeyColumn : primaryKeyColumns) {
            updatedRow.put(primaryKeyColumn, row.get(primaryKeyColumn));
          }

          // Set the new vector column to the original text
          updatedRow.put(newVectorColumn, text);

          updatedRows.add(updatedRow);
        }
      }

      // Inserting a row with a primary key that already exists in the table will
      // overwrite the specified column but leave unspecified columns unchanged.
      table.insertMany(updatedRows);
      migratedCount += updatedRows.size();

      System.out.println("Migrated " + migratedCount + " rows. Page state: " + pageState);

      if (pageState == null) {
        System.out.println("Reached final page. Migration complete.");
        break;
      }
    }
  }
}
