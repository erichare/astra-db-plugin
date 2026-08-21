import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.tables.Table;
import com.datastax.astra.client.tables.definition.rows.Row;

public class Example {

  public static void main(String[] args) {
    // Get an existing table
    Table<Row> table =
        new DataAPIClient("**APPLICATION_TOKEN**")
            .getDatabase("**API_ENDPOINT**")
            .getTable("**TABLE_NAME**");

    // List indexes
    table.listIndexes().forEach(index -> System.out.println(index));
  }
}
