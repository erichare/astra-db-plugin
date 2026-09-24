import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.databases.Database;
import com.datastax.astra.client.tables.definition.types.TableUserDefinedTypeDefinition;

public class Example {

  public static void main(String[] args) {
    // Get a database
    Database database = new DataAPIClient(System.getenv("ASTRA_DB_APPLICATION_TOKEN")).getDatabase(System.getenv("ASTRA_DB_API_ENDPOINT"));

    // Create a user-defined type
    TableUserDefinedTypeDefinition typeDefinition =
        new TableUserDefinedTypeDefinition()
            .addFieldText("name")
            .addFieldBoolean("is_active")
            .addFieldDate("date_joined");
    database.createType("member", typeDefinition);
  }
}
