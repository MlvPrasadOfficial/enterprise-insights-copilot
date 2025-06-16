# Function Reference Error Fix

## Issue Description

We encountered a JavaScript runtime error in the application:

```
ReferenceError: getAgentRoleCapabilities is not defined
    at http://localhost:3000/_next/static/chunks/_0dc96777._.js:5993:72
```

This error was occurring in the `LiveFlow` component when trying to pass agent capabilities to the `AgentPanel` components.

## Root Cause

After investigating the codebase, we found that there was a name mismatch between the function definition and its usage:

1. The function was **defined** as:
   ```javascript
   const getAgentCapabilities = (agentType: string): AgentCapability[] => { ... }
   ```

2. But it was being **called** as:
   ```javascript
   agentCapabilities={getAgentRoleCapabilities(agent.type)}
   ```

This discrepancy in function names caused a reference error at runtime.

## Solution Implemented

We fixed the issue by updating the function calls to match the actual function name:

```javascript
// Before
agentCapabilities={getAgentRoleCapabilities(agent.type)}

// After
agentCapabilities={getAgentCapabilities(agent.type)}
```

The correction was applied to two separate instances in the `LiveFlow.tsx` file where the incorrect function name was being used:
1. In the File Upload Agents section
2. In the Chat Response Agents section

## Impact

This fix resolves the runtime error that was preventing the application from properly rendering the agent panels. With this correction:

- The application no longer throws the reference error
- The agent panels now correctly display their capabilities
- The user experience is improved with proper functionality

## Lessons Learned

- Always ensure function names match exactly between definition and usage
- Consider using IDE tools that can detect undefined references during development
- When refactoring function names, use search tools to find all instances where the function is called
