"""
Test the agent status tracking functionality.

This test script verifies that the agent status tracking system works correctly,
including setting agent statuses, retrieving them, and tracking changes over time.
"""

import sys
import os
import time
import requests
import json
from typing import Dict, Any
import unittest

# Add the parent directory to the path so we can import from backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.core.agent_status import (
    update_agent_status,
    get_agent_statuses,
    clear_agent_statuses,
    reset_all_statuses,
)

# Constants
API_URL = "http://localhost:8000"

class TestAgentStatusTracking(unittest.TestCase):
    def setUp(self):
        # Reset all statuses before each test
        reset_all_statuses()
    
    def test_update_and_get_status(self):
        """Test basic functionality of updating and retrieving agent status."""
        session_id = "test-session-1"
        
        # Update status for an agent
        update_agent_status(
            session_id=session_id,
            agent_name="Test Agent",
            status="working",
            agent_type="planner",
            message="Testing agent status"
        )
        
        # Retrieve the status
        statuses = get_agent_statuses(session_id)
        
        # Assert we have one status
        self.assertEqual(len(statuses), 1)
        self.assertEqual(statuses[0]["name"], "Test Agent")
        self.assertEqual(statuses[0]["status"], "working")
        self.assertEqual(statuses[0]["type"], "planner")
        self.assertEqual(statuses[0]["message"], "Testing agent status")
    
    def test_multiple_agents(self):
        """Test tracking multiple agents."""
        session_id = "test-session-2"
        
        # Update status for multiple agents
        update_agent_status(
            session_id=session_id,
            agent_name="Agent 1",
            status="working",
            agent_type="planner",
            message="Planning"
        )
        
        update_agent_status(
            session_id=session_id,
            agent_name="Agent 2",
            status="working",
            agent_type="chart",
            message="Making chart"
        )
        
        # Retrieve statuses
        statuses = get_agent_statuses(session_id)
        
        # Assert we have two statuses
        self.assertEqual(len(statuses), 2)
        self.assertTrue(any(s["name"] == "Agent 1" for s in statuses))
        self.assertTrue(any(s["name"] == "Agent 2" for s in statuses))
    
    def test_status_update(self):
        """Test updating an existing agent's status."""
        session_id = "test-session-3"
        
        # Create initial status
        update_agent_status(
            session_id=session_id,
            agent_name="Updating Agent",
            status="working",
            agent_type="sql",
            message="Initial message"
        )
        
        # Update status
        update_agent_status(
            session_id=session_id,
            agent_name="Updating Agent",
            status="complete",
            agent_type="sql",
            message="Updated message"
        )
        
        # Retrieve status
        statuses = get_agent_statuses(session_id)
        
        # Assert status was updated
        self.assertEqual(len(statuses), 1)
        self.assertEqual(statuses[0]["status"], "complete")
        self.assertEqual(statuses[0]["message"], "Updated message")
        self.assertTrue("endTime" in statuses[0])
    
    def test_clear_statuses(self):
        """Test clearing statuses for a session."""
        session_id = "test-session-4"
        
        # Create some statuses
        update_agent_status(
            session_id=session_id,
            agent_name="Agent A",
            status="working",
            agent_type="planner",
            message="Working"
        )
        
        update_agent_status(
            session_id=session_id,
            agent_name="Agent B",
            status="working",
            agent_type="insight",
            message="Working"
        )
        
        # Clear statuses
        clear_agent_statuses(session_id)
        
        # Verify they're gone
        statuses = get_agent_statuses(session_id)
        self.assertEqual(len(statuses), 0)


def test_api_endpoints():
    """Test the agent status API endpoints."""
    session_id = f"api-test-{int(time.time())}"
    
    # Test reset endpoint
    response = requests.post(
        f"{API_URL}/api/v1/reset-agent-status",
        json={"session_id": session_id}
    )
    assert response.status_code == 200
    
    # Test get endpoint when empty
    response = requests.get(
        f"{API_URL}/api/v1/agent-status",
        params={"session_id": session_id}
    )
    assert response.status_code == 200
    data = response.json()
    assert "agents" in data
    assert len(data["agents"]) == 0
    
    # Test multiagent query with status tracking
    response = requests.post(
        f"{API_URL}/api/v1/multiagent-query",
        json={
            "query": "Show me a chart of sales by region",
            "session_id": session_id
        }
    )
    assert response.status_code == 200
    
    # Wait a bit for agents to update
    time.sleep(2)
    
    # Test get endpoint to see if agents were tracked
    response = requests.get(
        f"{API_URL}/api/v1/agent-status",
        params={"session_id": session_id}
    )
    assert response.status_code == 200
    data = response.json()
    assert "agents" in data
    
    # Print agent statuses
    print("\nAgent Statuses:")
    for agent in data["agents"]:
        print(f"- {agent['name']}: {agent['status']} - {agent['message']}")
    
    assert len(data["agents"]) > 0


if __name__ == "__main__":
    # Run unit tests
    unittest.main(argv=['first-arg-is-ignored'], exit=False)
    
    # Try API tests if server is running
    try:
        print("\nTesting API endpoints...")
        test_api_endpoints()
        print("API tests passed!")
    except Exception as e:
        print(f"API tests failed: {e}")
        print("(Make sure the backend server is running)")
