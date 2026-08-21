import com.datastax.astra.client.DataAPIClient;
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
            .addVectorize("summary_genres_vector", "Text to vectorize")
            .addText("summary_genres_original_text", "Text to vectorize");
    TableInsertOneResult result = table.insertOne(row);
    System.out.println(result.getInsertedId());
  }
}
