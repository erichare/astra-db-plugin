import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.core.query.Sort;
import com.datastax.astra.client.core.vector.DataAPIVector;
import com.datastax.astra.client.tables.Table;
import com.datastax.astra.client.tables.commands.options.TableFindOptions;
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
    TableFindOptions options =
        new TableFindOptions()
            .sort(
                Sort.vector(
                    "summary_genres_vector",
                    new DataAPIVector(new float[] {0.08f, -0.62f, 0.39f})));
    TableFindCursor<Row, Row> cursor = table.find(options);
    // Iterate over the found rows
    for (Row row : cursor) {
      System.out.println(row);
    }
  }
}
