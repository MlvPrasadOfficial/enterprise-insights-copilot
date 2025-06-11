#!/usr/bin/env python3
"""
Test script to upload a CSV file to the backend
"""
import requests
import os

def test_upload():
    # File to upload
    csv_file_path = r"C:\AIPROJECT\enterprise_insights_copilot\data\sample_data.csv"
    api_url = "http://localhost:8000/api/v1/index"
    
    print(f"Testing upload to: {api_url}")
    print(f"File: {csv_file_path}")
    
    if not os.path.exists(csv_file_path):
        print(f"Error: File not found at {csv_file_path}")
        return
    
    try:
        # Prepare the file for upload
        with open(csv_file_path, 'rb') as f:
            files = {'file': ('sample_data.csv', f, 'text/csv')}
            
            # Send the POST request
            response = requests.post(api_url, files=files)
            
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.text}")
            
            if response.status_code == 200:
                data = response.json()
                print("✅ Upload successful!")
                print(f"Rows indexed: {data.get('rows_indexed', 'N/A')}")
                print(f"Preview columns: {len(data.get('preview', {}).get('columns', []))}")
                print(f"Preview rows: {len(data.get('preview', {}).get('rows', []))}")
            else:
                print(f"❌ Upload failed with status {response.status_code}")
                
    except Exception as e:
        print(f"❌ Error during upload: {e}")

if __name__ == "__main__":
    test_upload()
