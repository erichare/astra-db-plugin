import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.core.query.Filter;
import com.datastax.astra.client.core.query.Filters;
import com.datastax.astra.client.tables.Table;
import com.datastax.astra.client.tables.definition.rows.Row;
import java.util.List;
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
        Filters.nin(
            "metadata", List.of("language", "French"), List.of("edition", "Illustrated Edition"));

    Optional<Row> result = table.findOne(filter);

    System.out.println(result);
  }
}
