#!/usr/bin/env python
"""
Test Script for Agent Status and Visualization

This script helps test the agent status API endpoints and simulate
different agent workflows to debug visualization issues in the frontend.
"""

import requests
import json
import time
from datetime import datetime
import argparse
import random
import sys
from typing import Dict, List, Any, Optional

# API URL
API_URL = "http://localhost:8000"

# Agent types
AGENT_TYPES = ["planner", "chart", "sql", "insight", "critique", "debate", "data_cleaner", "retrieval", "narrative"]

# Status types
STATUS_TYPES = ["idle", "working", "complete", "error"]

def get_current_time_iso():
    """Get current time in ISO format"""
    return datetime.utcnow().isoformat() + "Z"

def create_agent_status(session_id: str, agent_name: str, agent_type: str, status: str, message: str, 
                        start_time: Optional[str] = None, end_time: Optional[str] = None) -> Dict:
    """Create agent status payload"""
    payload = {
        "session_id": session_id,
        "agent_name": agent_name,
        "agent_type": agent_type,
        "status": status,
        "message": message,
    }
    
    if start_time:
        payload["start_time"] = start_time
    
    if end_time:
        payload["end_time"] = end_time
        
    return payload

def reset_agent_status(session_id: str) -> None:
    """Reset agent status for a session"""
    print(f"Resetting agent status for session {session_id}...")
    
    try:
        response = requests.post(
            f"{API_URL}/api/v1/reset-agent-status",
            json={"session_id": session_id}
        )
        response.raise_for_status()
        print("✓ Successfully reset agent status")
    except Exception as e:
        print(f"✗ Error resetting agent status: {e}")
        sys.exit(1)

def get_agent_status(session_id: str) -> List[Dict]:
    """Get current agent status for a session"""
    print(f"Getting agent status for session {session_id}...")
    
    try:
        response = requests.get(
            f"{API_URL}/api/v1/agent-status",
            params={"session_id": session_id}
        )
        response.raise_for_status()
        data = response.json()
        print(f"✓ Found {len(data.get('agents', []))} agents")
        return data.get("agents", [])
    except Exception as e:
        print(f"✗ Error getting agent status: {e}")
        return []

def update_agent_status(payload: Dict) -> None:
    """Directly update agent status via the API"""
    # Note: This function would require a custom endpoint to be added to the backend
    # For now, we'll simulate this by making a multiagent-query with test params
    print(f"Updating agent status for {payload['agent_name']}...")
    
    try:
        # This is where we would make an API call if a direct update_agent_status endpoint existed
        # For now, we'll just print the payload we would send
        print(json.dumps(payload, indent=2))
    except Exception as e:
        print(f"✗ Error updating agent status: {e}")

def simulate_agent_workflow(session_id: str, scenario: str) -> None:
    """Simulate a specific agent workflow scenario"""
    print(f"Simulating scenario: {scenario}")
    
    # Reset agent status to start fresh
    reset_agent_status(session_id)
    
    current_time = get_current_time_iso()
    
    if scenario == "basic_flow":
        # Simulate a basic planner -> SQL -> chart flow
        
        # 1. Start with planner working
        requests.post(
            f"{API_URL}/api/v1/multiagent-query",
            json={
                "query": "Show me a chart of sales by region",
                "session_id": session_id
            }
        )
        
        print("Planner agent started working...")
        time.sleep(2)  # Give time for the frontend to poll and update
        
        # 2. Check current status
        agents = get_agent_status(session_id)
        for agent in agents:
            print(f"- {agent['name']} is {agent['status']}")
            
        # Wait and let the actual agents work if the backend is running
        # or add manual updates if needed for testing when backend isn't available
        print("Waiting for agents to process request (5 seconds)...")
        time.sleep(5)
        
        # 3. Check final status
        agents = get_agent_status(session_id)
        for agent in agents:
            print(f"- {agent['name']} is {agent['status']}")
    
    elif scenario == "error_flow":
        # Simulate a flow where one agent encounters an error
        
        # This would require custom handling in the backend to simulate errors
        # For now, we'll use a special query that might trigger an error:
        requests.post(
            f"{API_URL}/api/v1/multiagent-query",
            json={
                "query": "ERROR_TEST: Show data from a non-existent table",
                "session_id": session_id
            }
        )
        
        print("Started error flow test...")
        time.sleep(5)  # Give time for the backend to process and potentially generate an error
        
        # Check status
        agents = get_agent_status(session_id)
        for agent in agents:
            print(f"- {agent['name']} is {agent['status']}")
    
    else:
        print(f"Unknown scenario: {scenario}")

def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description="Test agent status and visualization")
    parser.add_argument("--session", default=f"test-session-{int(time.time())}", help="Session ID")
    parser.add_argument("--scenario", default="basic_flow", choices=["basic_flow", "error_flow"], help="Test scenario")
    args = parser.parse_args()
    
    print("=" * 50)
    print("Agent Visualization Test Tool")
    print("=" * 50)
    print(f"API URL: {API_URL}")
    print(f"Session ID: {args.session}")
    print(f"Scenario: {args.scenario}")
    print("-" * 50)
    
    # Run the test scenario
    simulate_agent_workflow(args.session, args.scenario)
    
    print("-" * 50)
    print("Test completed!")

if __name__ == "__main__":
    main()
