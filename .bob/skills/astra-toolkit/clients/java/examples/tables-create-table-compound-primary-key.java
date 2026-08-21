import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.core.query.SortOrder;
import com.datastax.astra.client.databases.Database;
import com.datastax.astra.client.tables.Table;
import com.datastax.astra.client.tables.definition.columns.TableColumnTypes;
import com.datastax.astra.client.tables.mapping.Column;
import com.datastax.astra.client.tables.mapping.EntityTable;
import com.datastax.astra.client.tables.mapping.PartitionBy;
import com.datastax.astra.client.tables.mapping.PartitionSort;
import java.util.Date;
import java.util.Map;
import java.util.Set;
import lombok.Data;

public class Example {
  @EntityTable("example_table")
  @Data
  public class Book {
    @PartitionBy(0)
    @Column(name = "title", type = TableColumnTypes.TEXT)
    private String title;

    @PartitionSort(position = 0, order = SortOrder.ASCENDING)
    @Column(name = "number_of_pages", type = TableColumnTypes.INT)
    private Integer number_of_pages;

    @PartitionBy(1)
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

    @PartitionSort(position = 1, order = SortOrder.DESCENDING)
    @Column(name = "is_checked_out", type = TableColumnTypes.BOOLEAN)
    private Boolean is_checked_out;

    @Column(name = "due_date", type = TableColumnTypes.DATE)
    private Date due_date;
  }

  public static void main(String[] args) {
    // Get an existing database
    Database database = new DataAPIClient("**APPLICATION_TOKEN**").getDatabase("**API_ENDPOINT**");

    Table<Book> table = database.createTable(Book.class);
  }
}

// ==============  BOUNDARY BETWEEN EXAMPLE SNIPPETS  ==============

import static com.datastax.astra.client.core.query.Sort.ascending;
import static com.datastax.astra.client.core.query.Sort.descending;

import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.databases.Database;
import com.datastax.astra.client.tables.Table;
import com.datastax.astra.client.tables.definition.TableDefinition;
import com.datastax.astra.client.tables.definition.columns.TableColumnTypes;
import com.datastax.astra.client.tables.definition.rows.Row;

public class Example {
  public static void main(String[] args) {
    // Get an existing database
    Database database = new DataAPIClient("**APPLICATION_TOKEN**").getDatabase("**API_ENDPOINT**");

    TableDefinition tableDefinition =
        new TableDefinition()
            // Define all of the columns in the table
            .addColumnText("title")
            .addColumnInt("number_of_pages")
            .addColumn("rating", TableColumnTypes.FLOAT)
            .addColumnSet("genres", TableColumnTypes.TEXT)
            .addColumnMap("metadata", TableColumnTypes.TEXT, TableColumnTypes.TEXT)
            .addColumnBoolean("is_checked_out")
            .addColumn("due_date", TableColumnTypes.DATE)
            // Define the primary key for the table.
            // In this case, the table uses a compound primary key.
            .addPartitionBy("title")
            .addPartitionBy("rating")
            .addPartitionSort(ascending("number_of_pages"))
            .addPartitionSort(descending("is_checked_out"));

    Table<Row> table = database.createTable("example_table", tableDefinition);
  }
}
