using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Core;

namespace Examples;

public class Program
{
  static void Main()
  {
    var client = new DataAPIClient("**APPLICATION_TOKEN**");
  }
}
