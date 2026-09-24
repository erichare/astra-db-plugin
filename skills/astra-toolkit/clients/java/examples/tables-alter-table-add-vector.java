import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.tables.Table;
import com.datastax.astra.client.tables.commands.AlterTableAddColumns;
import com.datastax.astra.client.tables.definition.columns.TableColumnDefinitionVector;
import com.datastax.astra.client.tables.definition.rows.Row;

public class Example {

  public static void main(String[] args) {
    // Get an existing table
    Table<Row> table =
        new DataAPIClient(System.getenv("ASTRA_DB_APPLICATION_TOKEN"))
            .getDatabase(System.getenv("ASTRA_DB_API_ENDPOINT"))
            .getTable("**TABLE_NAME**");

    // Add a vector column
    AlterTableAddColumns alterOperation =
        new AlterTableAddColumns()
            .addColumnVector("example_vector", new TableColumnDefinitionVector().dimension(1024));
    table.alter(alterOperation);
  }
}
