"""
Initialize and verify the agent status tracking system.

This script:
1. Checks if our agent_status.py module is correctly installed and working
2. Verifies that the backend endpoints for agent status work correctly
3. Runs a simple test of the multi-agent workflow with agent status tracking

Usage:
    python scripts/verify_agent_tracking.py
"""

import os
import sys
import time
import json
import requests
from datetime import datetime

# Add the project root to the path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Check if agent_status module is available
try:
    from backend.core.agent_status import (
        update_agent_status,
        get_agent_statuses,
        clear_agent_statuses,
        reset_all_statuses,
    )
    print("[✓] Agent status module imported successfully")
except ImportError as e:
    print(f"[✗] Error importing agent status module: {e}")
    sys.exit(1)

# Constants
API_URL = "http://localhost:8000"
TEST_SESSION_ID = f"test-session-{int(datetime.now().timestamp())}"

def test_agent_status_local():
    """Test the agent status tracking locally"""
    print("\nTesting local agent status tracking...")
    
    # Reset all statuses
    reset_all_statuses()
    print("[✓] Reset all agent statuses")
    
    # Create some test agents
    update_agent_status(
        session_id=TEST_SESSION_ID,
        agent_name="Test Planner",
        status="working",
        agent_type="planner",
        message="Planning test workflow"
    )
    print("[✓] Added planner agent")
    
    update_agent_status(
        session_id=TEST_SESSION_ID,
        agent_name="Test Chart Agent",
        status="idle",
        agent_type="chart",
        message="Waiting for data"
    )
    print("[✓] Added chart agent")
    
    # Get agent statuses
    statuses = get_agent_statuses(TEST_SESSION_ID)
    if len(statuses) != 2:
        print(f"[✗] Expected 2 agents, got {len(statuses)}")
    else:
        print(f"[✓] Found {len(statuses)} agents as expected")
    
    # Update an agent status
    update_agent_status(
        session_id=TEST_SESSION_ID,
        agent_name="Test Chart Agent",
        status="working",
        agent_type="chart",
        message="Generating chart"
    )
    print("[✓] Updated chart agent status")
    
    # Get updated agent statuses
    statuses = get_agent_statuses(TEST_SESSION_ID)
    chart_agent = next((a for a in statuses if a["name"] == "Test Chart Agent"), None)
    if chart_agent and chart_agent["status"] == "working":
        print("[✓] Chart agent status updated correctly")
    else:
        print("[✗] Chart agent status not updated correctly")
    
    # Clear agent statuses
    clear_agent_statuses(TEST_SESSION_ID)
    statuses = get_agent_statuses(TEST_SESSION_ID)
    if len(statuses) == 0:
        print("[✓] Successfully cleared agent statuses")
    else:
        print(f"[✗] Failed to clear agent statuses, still have {len(statuses)}")
    
    print("Local agent status tracking tests completed")

def test_agent_status_api():
    """Test the agent status API endpoints"""
    print("\nTesting agent status API endpoints...")
    
    try:
        # Test if backend is running
        response = requests.get(f"{API_URL}/healthcheck", timeout=2)
        if response.status_code != 200:
            print("[✗] Backend server not responding correctly")
            return False
        print("[✓] Backend server is running")
        
        # Test reset endpoint
        response = requests.post(
            f"{API_URL}/api/v1/reset-agent-status",
            json={"session_id": TEST_SESSION_ID},
            timeout=5
        )
        if response.status_code != 200:
            print(f"[✗] Reset endpoint failed: {response.status_code}")
            return False
        print("[✓] Reset endpoint working")
        
        # Test get endpoint when empty
        response = requests.get(
            f"{API_URL}/api/v1/agent-status",
            params={"session_id": TEST_SESSION_ID},
            timeout=5
        )
        if response.status_code != 200:
            print(f"[✗] Get endpoint failed: {response.status_code}")
            return False
        print("[✓] Get endpoint working")
        
        data = response.json()
        if "agents" not in data:
            print("[✗] Get response missing 'agents' key")
            return False
        
        if len(data["agents"]) != 0:
            print(f"[✗] Expected empty agents list, got {len(data['agents'])}")
            return False
        print("[✓] Get endpoint returns empty agent list as expected")
        
        print("API endpoints are working correctly")
        return True
    
    except requests.exceptions.RequestException as e:
        print(f"[✗] API test failed: {e}")
        print("Is the backend server running? Try running start_backend.bat first.")
        return False

def test_multiagent_query():
    """Test the multiagent query endpoint with agent status tracking"""
    print("\nTesting multiagent query with agent status tracking...")
    
    try:
        # Reset agent statuses
        requests.post(
            f"{API_URL}/api/v1/reset-agent-status",
            json={"session_id": TEST_SESSION_ID},
            timeout=5
        )
        
        # Make a query
        print("Sending a test query to the multiagent endpoint...")
        response = requests.post(
            f"{API_URL}/api/v1/multiagent-query",
            json={
                "query": "Show me a chart of sales by region",
                "session_id": TEST_SESSION_ID
            },
            timeout=10
        )
        
        if response.status_code != 200:
            print(f"[✗] Multiagent query failed: {response.status_code}")
            return False
        
        print("[✓] Multiagent query completed")
        
        # Check if agents were tracked
        time.sleep(1)  # Give a moment for processing
        response = requests.get(
            f"{API_URL}/api/v1/agent-status",
            params={"session_id": TEST_SESSION_ID},
            timeout=5
        )
        
        if response.status_code != 200:
            print(f"[✗] Failed to get agent status after query: {response.status_code}")
            return False
        
        data = response.json()
        if "agents" not in data:
            print("[✗] Agent status response missing 'agents' key")
            return False
        
        if len(data["agents"]) == 0:
            print("[✗] No agents were tracked during the multiagent query")
            return False
        
        print(f"[✓] Found {len(data['agents'])} agent(s) tracked during the query:")
        for agent in data["agents"]:
            print(f"  - {agent['name']}: {agent['status']} - {agent['message']}")
        
        return True
    
    except requests.exceptions.RequestException as e:
        print(f"[✗] Multiagent test failed: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("AGENT STATUS TRACKING VERIFICATION")
    print("=" * 60)
    
    # Test local agent status tracking
    test_agent_status_local()
    
    # Test API endpoints if backend is running
    if test_agent_status_api():
        # If API is working, test multiagent flow
        test_multiagent_query()
    
    print("\nVerification complete. If all tests passed, the agent tracking system is working!")
