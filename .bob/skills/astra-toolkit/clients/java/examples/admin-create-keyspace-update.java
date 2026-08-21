import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.admin.DatabaseAdmin;
import com.datastax.astra.client.databases.Database;
import com.datastax.astra.client.databases.commands.options.CreateKeyspaceOptions;
import com.datastax.astra.client.databases.definition.keyspaces.KeyspaceDefinition;

public class Example {

  public static void main(String[] args) {
    // Get a database
    Database database = new DataAPIClient("**APPLICATION_TOKEN**").getDatabase("**API_ENDPOINT**");

    // Get an admin object
    DatabaseAdmin admin = database.getDatabaseAdmin();

    // Create a keyspace
    KeyspaceDefinition definition = new KeyspaceDefinition().name("**KEYSPACE_NAME**");
    CreateKeyspaceOptions keyspaceOptions = new CreateKeyspaceOptions().updateDBKeyspace(true);
    admin.createKeyspace(definition, keyspaceOptions);
  }
}
