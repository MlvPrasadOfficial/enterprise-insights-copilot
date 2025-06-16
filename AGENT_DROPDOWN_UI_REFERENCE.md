# Agent Dropdown UI Reference

This document provides a visual reference for how the agent panels with expandable dropdowns should appear in the UI.

## Standard Agent Panel (Closed State)

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  🧠 Agent Name                      [Outputs ▼] [Capabilities ▼]  │
│  Agent description                                  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Agent Panel with Outputs Expanded

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  🧠 Agent Name                      [Outputs ▲] [Capabilities ▼]  │
│  Agent description                                  │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ Agent Outputs                               │    │
│  │                                             │    │
│  │  ┌─────────────────────────────────────┐    │    │
│  │  │ Output Title                        │    │    │
│  │  │ Output content description          │    │    │
│  │  └─────────────────────────────────────┘    │    │
│  │                                             │    │
│  │  ┌─────────────────────────────────────┐    │    │
│  │  │ Another Output                      │    │    │
│  │  │ More output content                 │    │    │
│  │  └─────────────────────────────────────┘    │    │
│  │                                             │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Agent Panel with Capabilities Expanded

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  🧠 Agent Name                      [Outputs ▼] [Capabilities ▲]  │
│  Agent description                                  │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ Agent Capabilities                          │    │
│  │                                             │    │
│  │  ┌─────────────────────────────────────┐    │    │
│  │  │ ● Capability Name                   │    │    │
│  │  │   Capability description            │    │    │
│  │  └─────────────────────────────────────┘    │    │
│  │                                             │    │
│  │  ┌─────────────────────────────────────┐    │    │
│  │  │ ● Another Capability                │    │    │
│  │  │   More capability details           │    │    │
│  │  └─────────────────────────────────────┘    │    │
│  │                                             │    │
│  │  ┌─────────────────────────────────────┐    │    │
│  │  │ ○ Disabled Capability               │    │    │
│  │  │   This capability is not available  │    │    │
│  │  └─────────────────────────────────────┘    │    │
│  │                                             │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Agent Panel with Details Expanded

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  🧠 Agent Name                      [Outputs ▼] [Capabilities ▼]  │
│  Agent description                                  │
│                                                     │
│  Processing Steps                                   │
│  ┌─────────────────────────────────────────────┐    │
│  │                                             │    │
│  │  ● Initializing                 Completed   │    │
│  │  ● Processing request           In Progress │    │
│  │  ○ Finalizing results           Pending     │    │
│  │                                             │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  [=======================================]          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

This shows how all agents will now have expandable sections instead of popup dropdowns, providing a more consistent, clean, and user-friendly interface across all agent types.
