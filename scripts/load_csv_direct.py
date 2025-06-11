import requests
import pandas as pd

# Load the CSV file
csv_path = "c:/AIPROJECT/enterprise_insights_copilot/data/sample_data.csv"

# Upload the file to the load_csv_memory endpoint
with open(csv_path, 'rb') as f:
    files = {'file': (csv_path, f)}
    response = requests.post('http://localhost:8000/load_csv_memory', files=files)
    print("Load response:", response.text)

# Check if data is loaded
memory_response = requests.get("http://localhost:8000/debug/memory_df")
print("Memory check:", memory_response.text)
