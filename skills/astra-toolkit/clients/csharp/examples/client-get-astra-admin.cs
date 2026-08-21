using DataStax.AstraDB.DataApi;

namespace Examples;

public class Program
{
  static void Main()
  {
    var client = new DataAPIClient("**APPLICATION_TOKEN**");

    var admin = client.GetAstraDatabasesAdmin();
  }
}
