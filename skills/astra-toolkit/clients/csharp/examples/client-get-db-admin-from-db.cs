using DataStax.AstraDB.DataApi;

namespace Examples;

public class Program
{
  static void Main()
  {
    // Get an existing database
    var client = new DataAPIClient();
    var database = client.GetDatabase(
      "**API_ENDPOINT**",
      "**APPLICATION_TOKEN**"
    );

    var databaseAdmin = database.GetAdmin();
  }
}
