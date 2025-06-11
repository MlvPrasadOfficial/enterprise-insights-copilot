import requests

def test_load_csv():
    url = "http://localhost:8000/load_csv_memory"
    files = {'file': open('c:/AIPROJECT/enterprise_insights_copilot/data/sample_data.csv', 'rb')}
    
    print("Sending request to", url)
    response = requests.post(url, files=files)
    print("Response status:", response.status_code)
    print("Response text:", response.text)
    
    # Check if data is loaded
    memory_check = requests.get("http://localhost:8000/debug/memory_df")
    print("Memory check status:", memory_check.status_code)
    print("Memory check text:", memory_check.text)

if __name__ == "__main__":
    test_load_csv()
