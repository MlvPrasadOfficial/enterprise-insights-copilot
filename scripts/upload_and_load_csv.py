import requests
import pandas as pd
import io

url = "http://localhost:8000/upload"
files = {"file": open("c:/AIPROJECT/enterprise_insights_copilot/data/sample_data.csv", "rb")}

# Upload the file first
response = requests.post(url, files=files)
print("Upload response:", response.text)

# Now try to read the CSV directly from memory
csv_url = "http://localhost:8000/load_csv_memory"
response = requests.post(csv_url, files=files)
print("Load CSV response:", response.text)

# Check if data is now loaded
memory_response = requests.get("http://localhost:8000/debug/memory_df")
print("Memory check:", memory_response.text)
