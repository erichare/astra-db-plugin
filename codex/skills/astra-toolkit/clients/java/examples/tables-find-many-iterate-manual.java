import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.core.paging.Page;
import com.datastax.astra.client.core.query.Filter;
import com.datastax.astra.client.core.query.Filters;
import com.datastax.astra.client.tables.Table;
import com.datastax.astra.client.tables.commands.options.TableFindOptions;
import com.datastax.astra.client.tables.definition.rows.Row;

public class Example {

  public static void main(String[] args) {
    // Get an existing table
    Table<Row> table =
        new DataAPIClient("**APPLICATION_TOKEN**")
            .getDatabase("**API_ENDPOINT**")
            .getTable("**TABLE_NAME**");

    // Create the filter
    Filter filter =
        Filters.and(Filters.eq("is_checked_out", false), Filters.lt("number_of_pages", 300));

    // Get the first page
    Page<Row> page1 = table.findPage(filter, null);
    page1.getResults().forEach(System.out::println);
    String paginationState1 = page1.getPageState().orElse(null);

    // Get the next page
    if (paginationState1 != null) {
      Page<Row> page2 = table.findPage(filter, new TableFindOptions().pageState(paginationState1));
      page2.getResults().forEach(System.out::println);
    }
  }
}
