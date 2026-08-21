import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.core.query.Sort;
import com.datastax.astra.client.tables.Table;
import com.datastax.astra.client.tables.commands.options.TableFindOneOptions;
import com.datastax.astra.client.tables.definition.rows.Row;
import java.util.Optional;

public class Example {

  public static void main(String[] args) {
    // Get an existing table
    Table<Row> table =
        new DataAPIClient("**APPLICATION_TOKEN**")
            .getDatabase("**API_ENDPOINT**")
            .getTable("**TABLE_NAME**");

    // Find a row
    TableFindOneOptions options =
        new TableFindOneOptions()
            .sort(Sort.vectorize("summary_genres_vector", "Text to vectorize"));

    Optional<Row> result = table.findOne(options);
    System.out.println(result);
  }
}
