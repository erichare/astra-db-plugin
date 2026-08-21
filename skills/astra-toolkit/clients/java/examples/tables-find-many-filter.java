import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.core.query.Filter;
import com.datastax.astra.client.core.query.Filters;
import com.datastax.astra.client.tables.Table;
import com.datastax.astra.client.tables.cursor.TableFindCursor;
import com.datastax.astra.client.tables.definition.rows.Row;

public class Example {

  public static void main(String[] args) {
    // Get an existing table
    Table<Row> table =
        new DataAPIClient("**APPLICATION_TOKEN**")
            .getDatabase("**API_ENDPOINT**")
            .getTable("**TABLE_NAME**");

    // Find rows
    Filter filter =
        Filters.and(Filters.eq("is_checked_out", false), Filters.lt("number_of_pages", 300));

    TableFindCursor<Row, Row> cursor = table.find(filter);

    // Iterate over the found rows
    for (Row row : cursor) {
      System.out.println(row);
    }
  }
}
