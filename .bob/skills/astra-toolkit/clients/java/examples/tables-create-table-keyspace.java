import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.databases.Database;
import com.datastax.astra.client.tables.Table;
import com.datastax.astra.client.tables.definition.TableDefinition;
import com.datastax.astra.client.tables.definition.columns.TableColumnTypes;
import com.datastax.astra.client.tables.definition.rows.Row;

public class Example {
  public static void main(String[] args) {
    // Get an existing database
    Database database =
        new DataAPIClient("**APPLICATION_TOKEN**")
            .getDatabase("**API_ENDPOINT**", "**KEYSPACE_NAME**");

    TableDefinition tableDefinition =
        new TableDefinition()
            // Define all of the columns in the table
            .addColumnText("title")
            .addColumnInt("number_of_pages")
            .addColumn("rating", TableColumnTypes.FLOAT)
            .addColumnSet("genres", TableColumnTypes.TEXT)
            .addColumnMap("metadata", TableColumnTypes.TEXT, TableColumnTypes.TEXT)
            .addColumnBoolean("is_checked_out")
            .addColumn("due_date", TableColumnTypes.DATE)
            // Define the primary key for the table.
            // In this case, the table uses a single-column primary key.
            .addPartitionBy("title");

    Table<Row> table = database.createTable("example_table", tableDefinition);
  }
}
