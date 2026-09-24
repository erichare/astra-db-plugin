import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.databases.Database;
import com.datastax.astra.client.tables.commands.AlterTypeRenameFields;

public class Example {

  public static void main(String[] args) {
    // Get a database
    Database database = new DataAPIClient(System.getenv("ASTRA_DB_APPLICATION_TOKEN")).getDatabase(System.getenv("ASTRA_DB_API_ENDPOINT"));

    // Rename fields in a user-defined type
    database.alterType(
        "member",
        new AlterTypeRenameFields()
            .addField("name", "first_name")
            .addField("is_active", "is_member"));
  }
}
