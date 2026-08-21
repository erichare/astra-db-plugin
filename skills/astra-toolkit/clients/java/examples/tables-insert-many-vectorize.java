import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.tables.Table;
import com.datastax.astra.client.tables.commands.results.TableInsertManyResult;
import com.datastax.astra.client.tables.definition.rows.Row;
import java.util.List;

public class Example {

  public static void main(String[] args) {
    // Get an existing table
    Table<Row> table =
        new DataAPIClient("**APPLICATION_TOKEN**")
            .getDatabase("**API_ENDPOINT**")
            .getTable("**TABLE_NAME**");

    // Insert rows into the table
    Row row1 =
        new Row()
            .addText("title", "Computed Wilderness")
            .addText("author", "Ryan Eau")
            .addVectorize("summary_genres_vector", "Text to vectorize")
            .addText("summary_genres_original_text", "Text to vectorize");
    Row row2 =
        new Row()
            .addText("title", "Desert Peace")
            .addText("author", "Walter Dray")
            .addVectorize("summary_genres_vector", "Text to vectorize")
            .addText("summary_genres_original_text", "Text to vectorize");
    TableInsertManyResult result = table.insertMany(List.of(row1, row2));
    System.out.println(result.getInsertedIds());
  }
}
