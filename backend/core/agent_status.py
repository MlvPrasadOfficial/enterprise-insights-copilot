"""
Agent Status Tracking Module

This module provides functionality to track the status of different agents in the system,
including their current activity, progress, and any relevant messages.

It uses a simple in-memory store that can be accessed and updated from different parts of the application.
"""

from typing import Dict, List, Optional
from datetime import datetime
import threading

# Thread-safe lock for the agent status dictionary
_lock = threading.Lock()

# In-memory store for agent statuses
# Format: {session_id: [list of agent status dictionaries]}
_agent_statuses: Dict[str, List[Dict]] = {}

def update_agent_status(session_id: str, agent_name: str, status: str, 
                       agent_type: str, message: str, additional_data: Dict = None):
    """
    Update the status of an agent for a particular session.
    
    Args:
        session_id (str): The session identifier
        agent_name (str): Name of the agent (e.g. "Chart Generator")
        status (str): Current status (idle, working, complete, error)
        agent_type (str): Type of agent (planner, chart, sql, insight, critique, debate)
        message (str): Status message or current activity description
        additional_data (Dict, optional): Any additional data to store with the agent status
    """
    with _lock:
        if session_id not in _agent_statuses:
            _agent_statuses[session_id] = []
        
        # Check if the agent already exists in the status list
        for agent in _agent_statuses[session_id]:
            if agent['name'] == agent_name:
                # Update existing agent
                agent['status'] = status
                agent['message'] = message
                if status == 'working' and not agent.get('startTime'):
                    agent['startTime'] = datetime.now().isoformat()
                if status in ['complete', 'error']:
                    agent['endTime'] = datetime.now().isoformat()
                
                # Add any additional data to the agent status
                if additional_data:
                    for key, value in additional_data.items():
                        agent[key] = value
                return
        
        # Agent doesn't exist, add it
        new_agent = {
            'name': agent_name,
            'status': status,
            'type': agent_type,
            'message': message,
        }
        if status == 'working':
            new_agent['startTime'] = datetime.now().isoformat()
        
        # Add any additional data to the agent status
        if additional_data:
            for key, value in additional_data.items():
                new_agent[key] = value
            
        _agent_statuses[session_id].append(new_agent)

def get_agent_statuses(session_id: str) -> List[Dict]:
    """
    Get the statuses of all agents for a particular session.
    
    Args:
        session_id (str): The session identifier
        
    Returns:
        List[Dict]: List of agent status dictionaries
    """
    with _lock:
        return _agent_statuses.get(session_id, [])

def clear_agent_statuses(session_id: str):
    """
    Clear all agent statuses for a particular session.
    
    Args:
        session_id (str): The session identifier
    """
    with _lock:
        if session_id in _agent_statuses:
            _agent_statuses[session_id] = []

def reset_all_statuses():
    """
    Reset all agent statuses across all sessions (mainly for testing).
    """
    with _lock:
        _agent_statuses.clear()
