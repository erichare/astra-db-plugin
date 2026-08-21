import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.tables.Table;
import com.datastax.astra.client.tables.commands.results.TableInsertOneResult;
import com.datastax.astra.client.tables.definition.rows.Row;

public class Example {

  public static void main(String[] args) {
    // Get and existing table
    Table<Row> table =
        new DataAPIClient("**APPLICATION_TOKEN**")
            .getDatabase("**API_ENDPOINT**")
            .getTable("**TABLE_NAME**");

    // Insert binary values
    byte[] exampleBytes = {
      (byte) 0x3D, (byte) 0xFB, (byte) 0xE7, (byte) 0x6D,
      (byte) 0x3E, (byte) 0xE9, (byte) 0x78, (byte) 0xD5,
      (byte) 0x3F, (byte) 0x49, (byte) 0xFB, (byte) 0xE7
    };

    Row row = new Row().addBlob("example_blob", exampleBytes).addText("title", "Example");

    TableInsertOneResult result = table.insertOne(row);
  }
}
