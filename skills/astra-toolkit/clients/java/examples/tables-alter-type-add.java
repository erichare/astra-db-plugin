import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.databases.Database;
import com.datastax.astra.client.tables.commands.AlterTypeAddFields;

public class Example {

  public static void main(String[] args) {
    // Get a database
    Database database = new DataAPIClient("**APPLICATION_TOKEN**").getDatabase("**API_ENDPOINT**");

    // Add fields to a user-defined type
    database.alterType(
        "member", new AlterTypeAddFields().addFieldText("email").addFieldInt("credits"));
  }
}
