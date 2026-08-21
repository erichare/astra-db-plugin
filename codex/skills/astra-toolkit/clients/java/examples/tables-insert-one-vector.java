import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.core.vector.DataAPIVector;
import com.datastax.astra.client.tables.Table;
import com.datastax.astra.client.tables.commands.results.TableInsertOneResult;
import com.datastax.astra.client.tables.definition.rows.Row;

public class Example {

  public static void main(String[] args) {
    // Get an existing table
    Table<Row> table =
        new DataAPIClient("**APPLICATION_TOKEN**")
            .getDatabase("**API_ENDPOINT**")
            .getTable("**TABLE_NAME**");

    // Insert a row into the table
    Row row =
        new Row()
            .addText("title", "Computed Wilderness")
            .addText("author", "Ryan Eau")
            .addVector(
                "summary_genres_vector", new DataAPIVector(new float[] {0.08f, -0.62f, 0.39f}));
    TableInsertOneResult result = table.insertOne(row);
    System.out.println(result.getInsertedId());
  }
}
