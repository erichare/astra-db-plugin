from datetime import date
from typing import Dict, Optional, Set, TypedDict

from astrapy import DataAPIClient, Table


# Define the typing
class TableSchema(TypedDict):
    title: str
    author: str
    number_of_pages: int
    rating: float
    genres: Set[str]
    metadata: Dict[str, str]
    is_checked_out: bool
    due_date: Optional[date]


# Get an existing table
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
table: Table[TableSchema] = database.get_table(
    "**TABLE_NAME**", row_type=TableSchema
)
