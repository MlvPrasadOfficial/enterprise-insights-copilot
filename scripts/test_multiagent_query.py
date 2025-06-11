"""
A simple script to test the multiagent_query API endpoint
"""
import requests
import json
import sys
import time

API_URL = "http://localhost:8000"

def test_multiagent_query(query):
    """
    Test the multiagent_query API endpoint
    """
    session_id = f"test-session-{int(time.time())}"
    
    # Reset agent status first
    reset_response = requests.post(
        f"{API_URL}/api/v1/reset-agent-status",
        json={"session_id": session_id}
    )
    print(f"Reset agent status response: {reset_response.status_code}")
    
    # Make the multiagent query request
    response = requests.post(
        f"{API_URL}/api/v1/multiagent-query",
        json={"query": query, "session_id": session_id}
    )
    
    print(f"Status code: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print("\nResponse:")
        print(json.dumps(result, indent=2))
        
        # Check agent status
        time.sleep(1)  # Give the server a moment to update agent status
        status_response = requests.get(
            f"{API_URL}/api/v1/agent-status",
            params={"session_id": session_id}
        )
        
        if status_response.status_code == 200:
            agents = status_response.json().get("agents", [])
            print("\nAgent statuses:")
            for agent in agents:
                print(f"- {agent['name']} ({agent['type']}): {agent['status']} - {agent['message']}")
        else:
            print(f"Failed to get agent status: {status_response.status_code}")
    else:
        print(f"Request failed with error: {response.text}")

if __name__ == "__main__":
    query = "Show me a chart of sales over time"
    if len(sys.argv) > 1:
        query = sys.argv[1]
    
    print(f"Testing multiagent query with: '{query}'")
    test_multiagent_query(query)
