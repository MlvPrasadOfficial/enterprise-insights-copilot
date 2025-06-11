import requests

url = "http://localhost:8000/upload"
files = {"file": open("c:/AIPROJECT/enterprise_insights_copilot/data/sample_data.csv", "rb")}

response = requests.post(url, files=files)
print(response.text)
