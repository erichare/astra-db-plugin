import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.core.query.Filter;
import com.datastax.astra.client.tables.Table;
import com.datastax.astra.client.tables.definition.rows.Row;
import java.util.Arrays;
import java.util.Map;
import java.util.Optional;

public class Example {

  public static void main(String[] args) {
    // Get an existing table
    Table<Row> table =
        new DataAPIClient("**APPLICATION_TOKEN**")
            .getDatabase("**API_ENDPOINT**")
            .getTable("**TABLE_NAME**");

    // Find a row
    Filter filter =
        new Filter(
            Map.of(
                "metadata",
                Map.of("$values", Map.of("$in", Arrays.asList("French", "Illustrated Edition")))));

    Optional<Row> result = table.findOne(filter);

    System.out.println(result);
  }
}
