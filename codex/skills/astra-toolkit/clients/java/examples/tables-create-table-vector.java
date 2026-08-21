import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.core.vector.DataAPIVector;
import com.datastax.astra.client.databases.Database;
import com.datastax.astra.client.tables.Table;
import com.datastax.astra.client.tables.definition.columns.TableColumnTypes;
import com.datastax.astra.client.tables.mapping.Column;
import com.datastax.astra.client.tables.mapping.ColumnVector;
import com.datastax.astra.client.tables.mapping.EntityTable;
import com.datastax.astra.client.tables.mapping.PartitionBy;
import lombok.Data;

public class Example {
  @EntityTable("example_table")
  @Data
  public class Book {
    @ColumnVector(name = "example_vector", dimension = 1024)
    private DataAPIVector vector;

    @PartitionBy(0)
    @Column(name = "example_non_vector", type = TableColumnTypes.TEXT)
    private String exampleNonVector;
  }

  public static void main(String[] args) {
    // Get an existing database
    Database database = new DataAPIClient("**APPLICATION_TOKEN**").getDatabase("**API_ENDPOINT**");

    Table<Book> table = database.createTable(Book.class);
  }
}

// ==============  BOUNDARY BETWEEN EXAMPLE SNIPPETS  ==============

import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.databases.Database;
import com.datastax.astra.client.tables.Table;
import com.datastax.astra.client.tables.definition.TableDefinition;
import com.datastax.astra.client.tables.definition.columns.TableColumnDefinitionVector;
import com.datastax.astra.client.tables.definition.rows.Row;

public class Example {
  public static void main(String[] args) {
    // Get an existing database
    Database database = new DataAPIClient("**APPLICATION_TOKEN**").getDatabase("**API_ENDPOINT**");

    TableDefinition tableDefinition =
        new TableDefinition()
            // Define all of the columns in the table
            .addColumnVector("example_vector", new TableColumnDefinitionVector().dimension(1024))
            .addColumnText("example_non_vector")
            // Define the primary key for the table.
            // In this case, the table uses a single-column primary key.
            .addPartitionBy("example_non_vector");

    Table<Row> table = database.createTable("example_table", tableDefinition);
  }
}
