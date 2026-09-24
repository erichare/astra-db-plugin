import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.tables.Table;
import com.datastax.astra.client.tables.TableOptions;
import com.datastax.astra.client.tables.definition.rows.Row;

public class Example {

  public static void main(String[] args) {

    // Get an existing table
    TableOptions options = new TableOptions().keyspace("**KEYSPACE_NAME**");
    Table<Row> table =
        new DataAPIClient(System.getenv("ASTRA_DB_APPLICATION_TOKEN"))
            .getDatabase(System.getenv("ASTRA_DB_API_ENDPOINT"))
            .getTable("**TABLE_NAME**", options);
  }
}
