import sqlite3
from pathlib import Path

db_path = Path("backend/resume_builder.db")

if not db_path.exists():
    print(f"❌ Database file not found at {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get all table names
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()

print("=" * 80)
print("📊 SQLite Database Contents")
print("=" * 80)
print(f"\nDatabase: {db_path}")
print(f"Tables: {', '.join([t[0] for t in tables])}\n")

# View each table
for table in tables:
    table_name = table[0]
    print(f"\n{'─' * 80}")
    print(f"📋 Table: {table_name}")
    print(f"{'─' * 80}")
    
    # Get column info
    cursor.execute(f"PRAGMA table_info({table_name})")
    columns = cursor.fetchall()
    col_names = [col[1] for col in columns]
    print(f"Columns: {', '.join(col_names)}")
    
    # Get row count
    cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
    count = cursor.fetchone()[0]
    print(f"Rows: {count}")
    
    if count > 0:
        # Get data
        cursor.execute(f"SELECT * FROM {table_name}")
        rows = cursor.fetchall()
        
        # Print header
        print("\nData:")
        print(f"  {' | '.join(col_names)}")
        print(f"  {'-' * (len(' | '.join(col_names)))}")
        
        # Print rows (limit to 10)
        for i, row in enumerate(rows[:10]):
            row_str = " | ".join([str(val)[:50] if val else "NULL" for val in row])
            print(f"  {row_str}")
        
        if len(rows) > 10:
            print(f"  ... and {len(rows) - 10} more rows")

conn.close()
print("\n" + "=" * 80)
