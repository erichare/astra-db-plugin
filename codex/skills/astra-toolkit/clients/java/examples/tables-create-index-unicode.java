import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.tables.Table;
import com.datastax.astra.client.tables.commands.options.CreateIndexOptions;
import com.datastax.astra.client.tables.definition.indexes.TableIndexDefinitionOptions;
import com.datastax.astra.client.tables.definition.indexes.TableRegularIndexDefinition;
import com.datastax.astra.client.tables.definition.rows.Row;

public class Example {

  public static void main(String[] args) {
    // Get an existing table
    Table<Row> table =
        new DataAPIClient("**APPLICATION_TOKEN**")
            .getDatabase("**API_ENDPOINT**")
            .getTable("**TABLE_NAME**");

    // Index a column
    TableRegularIndexDefinition definition =
        new TableRegularIndexDefinition()
            .column("**COLUMN_NAME**")
            .options(new TableIndexDefinitionOptions().normalize(true));

    CreateIndexOptions options = new CreateIndexOptions();
    table.createIndex("**INDEX_NAME**", definition, options);
  }
}
