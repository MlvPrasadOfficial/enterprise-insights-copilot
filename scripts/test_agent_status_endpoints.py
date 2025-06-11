import requests
import time
import json
import sys

API_URL = "http://localhost:8000"
SESSION_ID = f"test-session-{int(time.time())}"

def load_sample_data():
    """Upload and load the sample data into memory"""
    print(f"Loading sample data with session ID: {SESSION_ID}")
    
    # Debug the memory_df endpoint first
    try:
        memory_check = requests.get(f"{API_URL}/debug/memory_df")
        print(f"Initial memory check: {memory_check.status_code}")
        print(f"Content: {memory_check.text}")
    except Exception as e:
        print(f"Error checking memory: {e}")
    
    # Load the CSV file directly into memory
    with open('c:/AIPROJECT/enterprise_insights_copilot/data/sample_data.csv', 'rb') as f:
        files = {'file': ('sample_data.csv', f)}
        try:
            print("Sending request to load CSV...")
            response = requests.post(f'{API_URL}/load_csv_memory', files=files)
            print(f"Load CSV response: {response.status_code}")
            print(response.text)
            
            # Check if data is now loaded
            memory_check = requests.get(f"{API_URL}/debug/memory_df")
            print(f"After load memory check: {memory_check.status_code}")
            print(f"Content: {memory_check.text}")
            
            return True
        except Exception as e:
            print(f"Error loading data: {e}")
            return False

def test_endpoints():
    """Test if the agent status endpoints exist"""
    print("\nTesting if endpoints exist...")
    
    try:
        # Test reset endpoint
        reset_response = requests.post(
            f"{API_URL}/api/v1/reset-agent-status",
            json={"session_id": SESSION_ID}
        )
        print(f"Reset endpoint: {reset_response.status_code}")
        print(reset_response.text)
        
        # Test get endpoint
        status_response = requests.get(
            f"{API_URL}/api/v1/agent-status",
            params={"session_id": SESSION_ID}
        )
        print(f"Status endpoint: {status_response.status_code}")
        print(status_response.text)
        
        return True
    except Exception as e:
        print(f"Error testing endpoints: {e}")
        return False

def test_multiagent_endpoints():
    """Test the multiagent query endpoint directly"""
    print("\nTesting multiagent endpoint...")
    
    try:
        response = requests.post(
            f"{API_URL}/api/v1/multiagent-query",
            json={
                "query": "Show me a summary of sales by category",
                "session_id": SESSION_ID
            }
        )
        print(f"Multiagent query response: {response.status_code}")
        if response.status_code == 200:
            print(json.dumps(response.json(), indent=2))
        else:
            print(response.text)
        
        return True
    except Exception as e:
        print(f"Error testing multiagent endpoint: {e}")
        return False

if __name__ == "__main__":
    print("===== AGENT STATUS TESTING =====")
    
    # First, load data
    if not load_sample_data():
        print("Failed to load data, exiting")
        sys.exit(1)
    
    # Test basic endpoints
    if not test_endpoints():
        print("Failed to test endpoints, exiting")
        sys.exit(1)
    
    # Test multiagent query
    if not test_multiagent_endpoints():
        print("Failed to test multiagent query, exiting")
        sys.exit(1)
    
    print("\nAll tests completed!")
