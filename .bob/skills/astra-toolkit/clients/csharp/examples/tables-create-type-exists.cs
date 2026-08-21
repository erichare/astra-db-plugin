using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Core;
using DataStax.AstraDB.DataApi.Tables;

namespace Examples;

// Define the user-defined type
[UserDefinedType("member")]
public class Member
{
  [ColumnName("name")]
  public string? Name { get; set; }

  [ColumnName("is_active")]
  public bool? IsActive { get; set; }

  [ColumnName("date_joined")]
  public DateOnly? DateJoined { get; set; }
};

public class Program
{
  static async Task Main()
  {
    // Get an existing table
    var client = new DataAPIClient();
    var database = client.GetDatabase(
      "**API_ENDPOINT**",
      "**APPLICATION_TOKEN**"
    );

    // Create a user-defined type
    await database.CreateTypeAsync<Member>(
      new CreateTypeOptions() { IfNotExists = true }
    );
  }
}
