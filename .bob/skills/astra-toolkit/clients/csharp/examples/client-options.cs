using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Core;

namespace Examples;

public class Program
{
  static void Main()
  {
    var options = new CommandOptions()
    {
      TimeoutOptions = new TimeoutOptions()
      {
        ConnectionTimeout = TimeSpan.FromMilliseconds(3000),
        RequestTimeout = TimeSpan.FromMilliseconds(9000),
      },
    };

    var client = new DataAPIClient(options);
  }
}
