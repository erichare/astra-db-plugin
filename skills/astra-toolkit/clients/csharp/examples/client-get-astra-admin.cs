using DataStax.AstraDB.DataApi;

namespace Examples;

public class Program
{
  static void Main()
  {
    var client = new DataAPIClient(System.Environment.GetEnvironmentVariable("ASTRA_DB_APPLICATION_TOKEN"));

    var admin = client.GetAstraDatabasesAdmin();
  }
}
