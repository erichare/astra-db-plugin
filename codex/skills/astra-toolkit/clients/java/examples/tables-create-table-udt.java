import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.databases.Database;
import com.datastax.astra.client.tables.Table;
import com.datastax.astra.client.tables.definition.columns.TableColumnTypes;
import com.datastax.astra.client.tables.definition.types.TableUserDefinedType;
import com.datastax.astra.client.tables.mapping.Column;
import com.datastax.astra.client.tables.mapping.EntityTable;
import com.datastax.astra.client.tables.mapping.PartitionBy;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import lombok.Data;

public class Example {
  // Define the user-defined type "person"
  @TableUserDefinedType("person")
  public class Person {
    @Column(name = "user_name", type = TableColumnTypes.TEXT)
    private String userName;

    @Column(name = "age", type = TableColumnTypes.INT)
    private Integer age;
  }

  // Define the table
  @EntityTable("example_table")
  @Data
  class Group {
    @PartitionBy(0)
    @Column(name = "id", type = TableColumnTypes.UUID)
    private UUID id;

    @Column(name = "group_leader", type = TableColumnTypes.USERDEFINED, udtName = "person")
    private Person groupLeader;

    @Column(
        name = "group_members",
        type = TableColumnTypes.SET,
        valueType = TableColumnTypes.USERDEFINED,
        udtName = "person")
    private Set<Person> groupMembers;

    @Column(
        name = "group_roles",
        type = TableColumnTypes.MAP,
        keyType = TableColumnTypes.TEXT,
        valueType = TableColumnTypes.USERDEFINED,
        udtName = "person")
    private Map<String, Person> groupRoles;
  }

  public static void main(String[] args) {
    Database database = new DataAPIClient("**APPLICATION_TOKEN**").getDatabase("**API_ENDPOINT**");

    Table<Group> table = database.createTable(Group.class);
  }
}

// ==============  BOUNDARY BETWEEN EXAMPLE SNIPPETS  ==============

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
            .addColumnUuid("id")
            .addColumnUserDefinedType("group_leader", "person")
            .addColumnSetUserDefinedType("group_members", "person")
            .addColumnMapUserDefinedType("group_roles", "person", TableColumnTypes.TEXT)
            // Define the primary key for the table.
            .addPartitionBy("id");
    Table<Row> table = database.createTable("example_table", tableDefinition);
  }
}
