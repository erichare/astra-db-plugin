import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.tables.Table;
import com.datastax.astra.client.tables.commands.options.CreateTextIndexOptions;
import com.datastax.astra.client.tables.definition.indexes.TableTextIndexDefinition;
import com.datastax.astra.client.tables.definition.rows.Row;

public class Example {

  public static void main(String[] args) {
    // Get an existing table
    Table<Row> table =
        new DataAPIClient("**APPLICATION_TOKEN**")
            .getDatabase("**API_ENDPOINT**")
            .getTable("**TABLE_NAME**");

    // Index a column
    CreateTextIndexOptions options = new CreateTextIndexOptions().ifNotExists(true);
    TableTextIndexDefinition definition =
        new TableTextIndexDefinition().column("**TEXT_COLUMN_NAME**");
    table.createTextIndex("**INDEX_NAME**", definition, options);
  }
}
