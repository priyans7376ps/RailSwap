import urllib.request
import json

# To test this we need a valid JWT token. But we can't easily get one without admin credentials.
# However, I can look at the backend logs! 
# Since we are on windows, maybe there is a log file? Or I can just write a script to check sqlite.
import sqlite3

conn = sqlite3.connect('instance/railswap.db')
c = conn.cursor()

c.execute("SELECT id, ticket_status, verification_status FROM tickets")
print("Tickets:", c.fetchall())

try:
    # try to see if there's any reports or transactions
    c.execute("SELECT id, ticket_id FROM transactions")
    print("Transactions:", c.fetchall())
except Exception as e:
    print(e)
    
try:
    c.execute("SELECT id, ticket_id FROM reports")
    print("Reports:", c.fetchall())
except Exception as e:
    print(e)

conn.close()
