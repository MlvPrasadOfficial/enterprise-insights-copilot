"use client";
import React, { useEffect, useState } from 'react';
import { getDataCleanerResults } from '../utils/api';

// Component to connect uploaded CSV data to the data cleaner results system
export default function DataCleanerConnector({ fileUploadStatus, onCSVDataReady }) {
  const [isConnecting, setIsConnecting] = useState(false);
  useEffect(() => {
    // This effect runs whenever fileUploadStatus changes
    if (fileUploadStatus && fileUploadStatus.preview && fileUploadStatus.preview.rows) {
      const connectCSVData = async () => {
        try {
          setIsConnecting(true);
          console.log("DataCleanerConnector: Connecting CSV data to data cleaner");
          console.log("DataCleanerConnector: Full fileUploadStatus:", fileUploadStatus);
          
          // Get current data from preview
          const csvRows = fileUploadStatus.preview.rows;
          const csvColumns = fileUploadStatus.preview.columns || [];
          
          // Log sample data for debugging
          console.log(`DataCleanerConnector: Processing ${csvRows.length} rows with columns:`, csvColumns);
          console.log("DataCleanerConnector: Sample data type:", typeof csvRows, Array.isArray(csvRows));
          console.log("DataCleanerConnector: Sample data:", csvRows.slice(0, 2));
            if (csvRows.length > 0) {
            console.log("DataCleanerConnector: First row keys:", Object.keys(csvRows[0]));
            // Check if these columns match what we see in the UI
            const actualColumns = Object.keys(csvRows[0]);
            console.log("DataCleanerConnector: Do actual columns match preview columns?", 
              JSON.stringify(actualColumns) === JSON.stringify(csvColumns));
          }
          
          // Make sure the data cleaner results are ready
          const results = await getDataCleanerResults();
          
          // Notify parent with the CSV data
          onCSVDataReady(csvRows);
          
          console.log("DataCleanerConnector: CSV data successfully connected to data cleaner");
        } catch (error) {
          console.error("DataCleanerConnector: Error connecting CSV data:", error);
        } finally {
          setIsConnecting(false);
        }
      };
        connectCSVData();
    }
  }, [fileUploadStatus, onCSVDataReady]);

  // This component doesn't render anything, it just connects data
  return null;
}
