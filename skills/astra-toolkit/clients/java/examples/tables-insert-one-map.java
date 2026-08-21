import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.tables.Table;
import com.datastax.astra.client.tables.commands.results.TableInsertOneResult;
import com.datastax.astra.client.tables.definition.rows.Row;
import java.util.Map;

public class Example {

  public static void main(String[] args) {
    // Get an existing table
    Table<Row> table =
        new DataAPIClient("**APPLICATION_TOKEN**")
            .getDatabase("**API_ENDPOINT**")
            .getTable("**TABLE_NAME**");

    // This map has non-string keys,
    // but the insertion can still be represented as a map
    // instead of an array of key-value pairs
    Map<Integer, String> mapColumn1 = Map.of(1, "value1", 2, "value2");

    // This map does not have non-string keys
    Map<String, String> mapColumn2 = Map.of("key1", "value1", "key2", "value2");

    Row row =
        new Row()
            .addMap("map_column_int_str", mapColumn1)
            .addMap("map_column_str_str", mapColumn2)
            .addText("title", "Once in a Living Memory")
            .addText("author", "Kayla McMaster");

    TableInsertOneResult result = table.insertOne(row);
    System.out.println(result.getInsertedId());
  }
}
