import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.core.query.Filter;
import com.datastax.astra.client.core.query.Filters;
import com.datastax.astra.client.tables.Table;
import com.datastax.astra.client.tables.commands.TableUpdateOperation;
import com.datastax.astra.client.tables.definition.rows.Row;
import java.util.Map;

public class Example {
  public static void main(String[] args) {
    // Get an existing table
    Table<Row> table =
        new DataAPIClient("**APPLICATION_TOKEN**")
            .getDatabase("**API_ENDPOINT**")
            .getTable("**TABLE_NAME**");

    // Update a row
    Filter filter = Filters.eq("title", "Chemistry Club");

    TableUpdateOperation update =
        new TableUpdateOperation()
            .set("president", Map.of("user_name", "lisa_m", "email", "lisa@example.com"))
            .set("vice_president", Map.of("user_name", "tanya_o", "email", "tanya@example.com"));

    table.updateOne(filter, update);
  }
}
