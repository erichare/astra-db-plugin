import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.tables.Table;
import com.datastax.astra.client.tables.commands.results.TableInsertOneResult;
import com.datastax.astra.client.tables.definition.rows.Row;
import java.util.Calendar;
import java.util.Date;
import java.util.Set;

public class Example {

  public static void main(String[] args) {
    // Get an existing table
    Table<Row> table =
        new DataAPIClient("**APPLICATION_TOKEN**")
            .getDatabase("**API_ENDPOINT**")
            .getTable("**TABLE_NAME**");

    // Insert a row into the table
    Calendar calendar = Calendar.getInstance();
    calendar.set(2024, Calendar.DECEMBER, 18);
    Date date = calendar.getTime();
    Row row =
        new Row()
            .addText("title", "Computed Wilderness")
            .addText("author", "Ryan Eau")
            .addInt("number_of_pages", 432)
            .addDate("due_date", date)
            .addSet("genres", Set.of("History", "Biography"));
    TableInsertOneResult result = table.insertOne(row);
    System.out.println(result.getInsertedId());
  }
}
