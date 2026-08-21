import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.databases.Database;
import com.datastax.astra.client.tables.commands.options.CreateTypeOptions;
import com.datastax.astra.client.tables.definition.types.TableUserDefinedTypeDefinition;

public class Example {

  public static void main(String[] args) {
    // Get a database
    Database database = new DataAPIClient("**APPLICATION_TOKEN**").getDatabase("**API_ENDPOINT**");

    // Create a user-defined type
    TableUserDefinedTypeDefinition typeDefinition =
        new TableUserDefinedTypeDefinition()
            .addFieldText("name")
            .addFieldBoolean("is_active")
            .addFieldDate("date_joined");
    database.createType("member", typeDefinition, new CreateTypeOptions().ifNotExists(true));
  }
}
