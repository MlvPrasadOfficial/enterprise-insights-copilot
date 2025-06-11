import requests
import time
import json

API_URL = "http://localhost:8000"
SESSION_ID = f"test-session-{int(time.time())}"

def load_sample_data():
    """Upload and load the sample data into memory"""
    print(f"Loading sample data with session ID: {SESSION_ID}")
    
    # Load the CSV file directly into memory
    with open('c:/AIPROJECT/enterprise_insights_copilot/data/sample_data.csv', 'rb') as f:
        files = {'file': ('sample_data.csv', f)}
        try:
            response = requests.post(f'{API_URL}/load_csv_memory', files=files)
            print(f"Load CSV response: {response.status_code}")
            print(response.text)
            return True
        except Exception as e:
            print(f"Error loading data: {e}")
            return False

def reset_agent_status():
    """Reset the agent status for the session"""
    print(f"Resetting agent status for session: {SESSION_ID}")
    
    try:
        response = requests.post(
            f'{API_URL}/api/v1/reset-agent-status',
            json={"session_id": SESSION_ID}
        )
        print(f"Reset agent status response: {response.status_code}")
        print(response.text)
        return True
    except Exception as e:
        print(f"Error resetting agent status: {e}")
        return False

def make_query():
    """Make a query to the multiagent API"""
    print(f"Making test query with session ID: {SESSION_ID}")
    
    try:
        response = requests.post(
            f'{API_URL}/api/v1/multiagent-query',
            json={
                "query": "Show me a summary of the product sales",
                "session_id": SESSION_ID
            }
        )
        print(f"Query response: {response.status_code}")
        print(json.dumps(response.json(), indent=2))
        return True
    except Exception as e:
        print(f"Error making query: {e}")
        return False

def check_agent_status():
    """Poll the agent status API"""
    print(f"Checking agent status for session: {SESSION_ID}")
    
    try:
        response = requests.get(
            f'{API_URL}/api/v1/agent-status',
            params={"session_id": SESSION_ID}
        )
        print(f"Agent status response: {response.status_code}")
        print(json.dumps(response.json(), indent=2))
        return True
    except Exception as e:
        print(f"Error checking agent status: {e}")
        return False

def run_test():
    """Run the full test sequence"""
    print("=== STARTING FULL TEST SEQUENCE ===")
    
    # Steps
    success = load_sample_data()
    if not success:
        print("Failed to load sample data, aborting test.")
        return
    
    success = reset_agent_status()
    if not success:
        print("Failed to reset agent status, but continuing...")
    
    success = make_query()
    if not success:
        print("Failed to make query, aborting test.")
        return
    
    # Poll agent status a few times
    print("Polling agent status...")
    for i in range(5):
        print(f"\nPolling attempt {i+1}:")
        check_agent_status()
        time.sleep(2)
    
    print("\n=== TEST COMPLETED ===")

if __name__ == "__main__":
    run_test()
