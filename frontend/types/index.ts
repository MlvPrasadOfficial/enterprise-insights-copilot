// Common types used across the Enterprise Insights Copilot application

// Agent status type definition
export interface AgentStatus {
  name: string;
  status: 'idle' | 'working' | 'complete' | 'error';
  type: 'planner' | 'chart' | 'sql' | 'insight' | 'critique' | 'debate' | 'data_cleaner' | 'retrieval' | 'narrative';
  message: string;
  startTime?: string; // ISO string dates
  endTime?: string;   // ISO string dates
}

// File upload status definition
export interface FileUploadStatus {
  fileName?: string;
  indexed: boolean;
  rowCount?: number;
}

// Agent activity log entry
export interface ActivityLog {
  timestamp: string;
  event: string;
  details?: string;
  agentType?: string;
}

// Chat message format
export interface Message {
  role: string;
  content: string;
  type?: "text" | "chart" | "table";
  data?: any;
}

// Process Visualizer props
export interface ProcessVisualizerProps {
  currentQuery?: string;
  activeAgents: AgentStatus[];
  fileUploadStatus?: FileUploadStatus;
}

// Agent Flow Chart props
export interface AgentFlowChartProps {
  activeAgents: AgentStatus[];
  currentQuery?: string;
}
