import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.tables.Table;
import com.datastax.astra.client.tables.definition.columns.TableColumnTypes;
import com.datastax.astra.client.tables.mapping.Column;
import java.util.Date;
import java.util.Map;
import java.util.Set;
import lombok.Data;
import lombok.NoArgsConstructor;

public class Example {
  @Data
  @NoArgsConstructor
  public class Book {
    @Column(name = "title", type = TableColumnTypes.TEXT)
    private String title;

    @Column(name = "author", type = TableColumnTypes.TEXT)
    private String author;

    @Column(name = "number_of_pages", type = TableColumnTypes.INT)
    private Integer number_of_pages;

    @Column(name = "rating", type = TableColumnTypes.FLOAT)
    private Float rating;

    @Column(name = "genres", type = TableColumnTypes.SET, valueType = TableColumnTypes.TEXT)
    private Set<String> genres;

    @Column(
        name = "metadata",
        type = TableColumnTypes.MAP,
        keyType = TableColumnTypes.TEXT,
        valueType = TableColumnTypes.TEXT)
    private Map<String, String> metadata;

    @Column(name = "is_checked_out", type = TableColumnTypes.BOOLEAN)
    private Boolean is_checked_out;

    @Column(name = "due_date", type = TableColumnTypes.DATE)
    private Date due_date;
  }

  public static void main(String[] args) {
    // Get an existing table
    Table<Book> table =
        new DataAPIClient("**APPLICATION_TOKEN**")
            .getDatabase("**API_ENDPOINT**")
            .getTable("**TABLE_NAME**", Book.class);
  }
}
