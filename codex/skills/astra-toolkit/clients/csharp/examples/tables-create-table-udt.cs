using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Tables;

namespace Examples;

// Define the user-defined type
// The type will be created if a type
// with the same name does not already exist
[UserDefinedType("person")]
public class Person
{
  [ColumnName("name")]
  public string? Name { get; set; }

  [ColumnName("level")]
  public int? Level { get; set; }
};

// Define the type for the row
[TableName("**TABLE_NAME**")]
public class ExampleRow
{
  [ColumnPrimaryKey]
  [ColumnName("id")]
  public Guid Id { get; set; }

  [ColumnName("group_leader")]
  public Person? GroupLeader { get; set; }

  [ColumnName("group_members")]
  public Person[]? GroupMembers { get; set; }

  [ColumnName("group_roles")]
  public Dictionary<string, Person>? GroupRoles { get; set; }
}

public class Program
{
  static async Task Main()
  {
    // Instantiate the client
    var client = new DataAPIClient();

    // Connect to a database
    var database = client.GetDatabase(
      "**API_ENDPOINT**",
      "**APPLICATION_TOKEN**"
    );

    // Create a table
    var table = await database.CreateTableAsync<ExampleRow>();
  }
}
