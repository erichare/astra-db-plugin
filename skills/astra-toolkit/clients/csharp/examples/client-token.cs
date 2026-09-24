using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Core;

namespace Examples;

public class Program
{
  static void Main()
  {
    var client = new DataAPIClient(System.Environment.GetEnvironmentVariable("ASTRA_DB_APPLICATION_TOKEN"));
  }
}
