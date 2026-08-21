import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.core.query.Sort;
import com.datastax.astra.client.core.vector.DataAPIVector;
import com.datastax.astra.client.tables.Table;
import com.datastax.astra.client.tables.commands.options.TableFindOneOptions;
import com.datastax.astra.client.tables.definition.rows.Row;
import java.util.Optional;

public class Example {

  public static void main(String[] args) {
    // Get an existing table
    Table<Row> table =
        new DataAPIClient("**APPLICATION_TOKEN**")
            .getDatabase("**API_ENDPOINT**")
            .getTable("**TABLE_NAME**");

    // Find a row
    TableFindOneOptions options =
        new TableFindOneOptions()
            .sort(
                Sort.vector(
                    "summary_genres_vector", new DataAPIVector(new float[] {0.08f, -0.62f, 0.39f})))
            .includeSimilarity(true);

    Optional<Row> result = table.findOne(options);

    if (result.isPresent()) {
      Row row = result.get();

      Double similarity = row.getDouble("$similarity");

      System.out.println(similarity);
    }
  }
}
