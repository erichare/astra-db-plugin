import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.core.query.Filter;
import com.datastax.astra.client.core.query.Filters;
import com.datastax.astra.client.tables.Table;
import com.datastax.astra.client.tables.commands.TableUpdateOperation;
import com.datastax.astra.client.tables.definition.rows.Row;
import java.util.Arrays;
import java.util.Map;

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
        new TableUpdateOperation(
            Map.of(
                "$push",
                Map.of(
                    // This update includes non-string keys,
                    // so the update is a key-value pair represented as an array
                    "map_column_int_str",
                    Arrays.asList(1, "value1"),
                    // This update does not include non-string keys,
                    // so the update can be a key-value pair represented as an array or a map
                    "map_column_str_str",
                    Map.of("key1", "value1"),
                    // When using $each, use an array of key-value pairs for non-string keys
                    "map_column_int_str_2",
                    Map.of(
                        "$each",
                        Arrays.asList(Arrays.asList(1, "value1"), Arrays.asList(2, "value2"))),
                    // When using $each, use an array of key-value pairs or maps for string keys
                    "map_column_str_str_2",
                    Map.of(
                        "$each",
                        Arrays.asList(
                            Map.of("key1", "value1"), Arrays.asList("key2", "value2"))))));

    table.updateOne(filter, update);
  }
}
