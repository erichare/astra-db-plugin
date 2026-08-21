import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.core.query.Filter;
import com.datastax.astra.client.core.query.Filters;
import com.datastax.astra.client.tables.Table;
import com.datastax.astra.client.tables.commands.TableUpdateOperation;
import com.datastax.astra.client.tables.definition.rows.Row;
import java.util.Arrays;

public class Example {

  public static void main(String[] args) {
    // Get an existing table
    Table<Row> table =
        new DataAPIClient("**APPLICATION_TOKEN**")
            .getDatabase("**API_ENDPOINT**")
            .getTable("**TABLE_NAME**");

    // Update a row
    Filter filter =
        Filters.and(
            Filters.eq("title", "Hidden Shadows of the Past"),
            Filters.eq("author", "John Anthony"));

    TableUpdateOperation update =
        new TableUpdateOperation()
            .set("rating", 4.5)
            .set("genres", Arrays.asList("Fiction", "Drama"))
            .unset("borrower");

    table.updateOne(filter, update);
  }
}
