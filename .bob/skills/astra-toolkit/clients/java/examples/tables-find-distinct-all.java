import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.core.query.Filter;
import com.datastax.astra.client.tables.Table;
import com.datastax.astra.client.tables.definition.rows.Row;
import java.util.Set;

public class Example {

  public static void main(String[] args) {
    // Get an existing table
    Table<Row> table =
        new DataAPIClient("**APPLICATION_TOKEN**")
            .getDatabase("**API_ENDPOINT**")
            .getTable("**TABLE_NAME**");

    // Find distinct values
    Filter filter = new Filter();
    Set<String> result = table.distinct("publication_year", filter, String.class);

    for (String fieldValue : result) {
      System.out.println(fieldValue);
    }
  }
}
