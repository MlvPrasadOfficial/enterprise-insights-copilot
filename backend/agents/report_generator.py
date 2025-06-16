"""
ReportGenerator: Utility for building PDF reports with insights and charts.
"""

from backend.agents.base_agent import BaseAgent
from fpdf import FPDF
import datetime
import os
import time
import pandas as pd
from backend.core.logging import logger
from backend.core.tracing import traced
from typing import Optional, Dict, Any, List, Union
import tempfile
import json
from pathlib import Path

class ReportGenerator(BaseAgent):
    name = "ReportGenerator"
    role = "Generates PDF reports with insights, charts and data summaries"

    def __init__(self, config=None):
        """
        Initialize ReportGenerator with configuration.
        Args:
            config: Optional configuration dictionary.
        """
        super().__init__(config)
        self.title = "Enterprise Insights Report"
        self.pdf = None
        self.report_sections = []
        self.temp_files = []  # Track temp files to clean up
        logger.info(f"[{self.name}] Initialized")

    def pre_process(self, query: str, data: Any, **kwargs) -> Dict[str, Any]:
        """
        Pre-processing hook executed before main logic.
        Args:
            query: The user's question or report request
            data: The DataFrame or data to include in the report
            **kwargs: Additional context including report title
        Returns:
            Dict with preprocessing results
        """
        context = super().pre_process(query, data, **kwargs)
        
        # Set report title if provided
        if "title" in kwargs:
            self.title = kwargs.get("title")
        elif query:
            # Generate title from query
            self.title = f"Report: {query[:50]}{'...' if len(query) > 50 else ''}"
            
        # Initialize PDF object
        self.pdf = FPDF()
        self.pdf.set_auto_page_break(auto=True, margin=15)
        
        logger.info(f"[{self.name}] Pre-processing with title: {self.title}")
        return context

    @traced(name="report_generator_execute")
    def _execute(self, query: str, data: pd.DataFrame, **kwargs) -> Dict[str, Any]:
        """
        Create a PDF report based on the query and data.
        
        Args:
            query (str): The user's report request.
            data (pd.DataFrame): The data to include in the report.
            **kwargs: Additional parameters including insights, charts, etc.
            
        Returns:
            Dict[str, Any]: Report metadata including the saved file path.
        """
        start_time = time.time()
        try:
            # Extract report components from kwargs
            insights = kwargs.get("insights", "")
            chart_paths = kwargs.get("chart_paths", [])
            sections = kwargs.get("sections", [])
            output_path = kwargs.get("output_path", self._generate_default_filename())
            
            # Add title and timestamp
            self.add_title()
            
            # Add executive summary if query provided
            if query:
                self.add_executive_summary(query)
                
            # Add custom sections if provided
            if sections:
                for section in sections:
                    self.add_section(
                        section.get("title", "Section"),
                        section.get("content", ""),
                        section.get("image_path")
                    )
            
            # Add insights section if provided
            if insights:
                self.add_insight_section(insights)
                
            # Add data summary
            self.add_data_summary(data)
            
            # Add charts if provided
            for chart_path in chart_paths:
                self.add_chart(chart_path)
                
            # Save the report
            saved_path = self.save(output_path)
            
            # Update metrics
            self._metrics.execution_time = time.time() - start_time
            
            # Cleanup temporary files
            self._cleanup_temp_files()
            
            return {
                "report_path": saved_path,
                "report_title": self.title,
                "page_count": self.pdf.page_no(),
                "created_at": datetime.datetime.now().isoformat(),
                "sections": self.report_sections
            }
            
        except Exception as e:
            logger.error(f"[{self.name}] Error in _execute: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            self._cleanup_temp_files()
            return {"error": f"Failed to generate report: {str(e)}"}

    def add_title(self) -> None:
        """
        Add the title and timestamp to the PDF report.
        """
        self.pdf.add_page()
        self.pdf.set_font("Arial", "B", 16)
        self.pdf.cell(0, 10, self.title, ln=True, align="C")
        self.pdf.set_font("Arial", "", 12)
        self.pdf.cell(
            0,
            10,
            f"Generated on: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}",
            ln=True,
        )
        logger.info(f"[{self.name}] Title and timestamp added")
        self.report_sections.append("Title")

    def add_executive_summary(self, query: str) -> None:
        """
        Add executive summary section based on the query.
        
        Args:
            query (str): The user's report request to summarize.
        """
        self.pdf.add_page()
        self.pdf.set_font("Arial", "B", 14)
        self.pdf.cell(0, 10, "Executive Summary", ln=True)
        self.pdf.set_font("Arial", "", 12)
        self.pdf.multi_cell(0, 8, f"This report addresses the query: {query}")
        logger.info(f"[{self.name}] Executive summary added")
        self.report_sections.append("Executive Summary")

    def add_insight_section(self, insight_text: str) -> None:
        """
        Add a section with key insights to the PDF report.
        
        Args:
            insight_text (str): The insights text to include.
        """
        self.pdf.add_page()
        self.pdf.set_font("Arial", "B", 14)
        self.pdf.cell(0, 10, "Key Insights", ln=True)
        self.pdf.set_font("Arial", "", 12)
        self.pdf.multi_cell(0, 8, insight_text)
        logger.info(f"[{self.name}] Insight section added")
        self.report_sections.append("Key Insights")

    def add_section(self, title: str, content: str, image_path: Optional[str] = None) -> None:
        """
        Add a custom section to the PDF report.
        
        Args:
            title (str): Section title.
            content (str): Section content text.
            image_path (Optional[str]): Optional path to an image to include.
        """
        self.pdf.add_page()
        self.pdf.set_font("Arial", "B", 14)
        self.pdf.cell(0, 10, title, ln=True)
        self.pdf.set_font("Arial", "", 12)
        self.pdf.multi_cell(0, 8, content)
        
        if image_path and os.path.exists(image_path):
            self.pdf.image(image_path, w=170)
            
        logger.info(f"[{self.name}] Custom section added: {title}")
        self.report_sections.append(title)

    def add_data_summary(self, data: pd.DataFrame) -> None:
        """
        Add a data summary section to the report.
        
        Args:
            data (pd.DataFrame): The DataFrame to summarize.
        """
        self.pdf.add_page()
        self.pdf.set_font("Arial", "B", 14)
        self.pdf.cell(0, 10, "Data Summary", ln=True)
        
        # Add basic info
        self.pdf.set_font("Arial", "B", 12)
        self.pdf.cell(0, 8, f"Dataset Size: {data.shape[0]} rows, {data.shape[1]} columns", ln=True)
        
        # Add column list
        self.pdf.cell(0, 8, "Columns:", ln=True)
        self.pdf.set_font("Arial", "", 10)
        for col in data.columns:
            dtype = str(data[col].dtype)
            missing = data[col].isna().sum()
            missing_pct = (missing / len(data)) * 100
            self.pdf.multi_cell(0, 6, f"- {col} ({dtype}): {missing} missing values ({missing_pct:.1f}%)")
            
        # Add top 5 rows as a table if not too large
        if data.shape[1] <= 10:  # Avoid tables with too many columns
            self.pdf.add_page()
            self.pdf.set_font("Arial", "B", 12)
            self.pdf.cell(0, 10, "Sample Data (First 5 Rows)", ln=True)
            
            # Create a temporary CSV and import it as a table
            with tempfile.NamedTemporaryFile(suffix='.csv', delete=False) as f:
                temp_csv = f.name
                data.head(5).to_csv(temp_csv, index=False)
                self.temp_files.append(temp_csv)
                
            try:
                from fpdf import XPos, YPos
                self.pdf.set_font("Arial", "", 8)
                col_width = 190 / min(data.shape[1], 10)
                row_height = 8
                
                # Print column headers
                for col in data.columns[:10]:  # Limit to 10 columns
                    self.pdf.cell(col_width, row_height, str(col)[:10], border=1)
                self.pdf.ln(row_height)
                
                # Print 5 rows
                for i in range(min(5, len(data))):
                    for col in data.columns[:10]:  # Limit to 10 columns
                        value = str(data.iloc[i][col])[:10]  # Truncate long values
                        self.pdf.cell(col_width, row_height, value, border=1)
                    self.pdf.ln(row_height)
            except Exception as e:
                logger.warning(f"[{self.name}] Error adding data table: {e}")
                self.pdf.multi_cell(0, 8, "Error rendering data table. See summary statistics instead.")
                
        logger.info(f"[{self.name}] Data summary section added")
        self.report_sections.append("Data Summary")

    def add_chart(self, chart_path: str) -> None:
        """
        Add a chart image to the PDF report if the file exists.
        
        Args:
            chart_path (str): Path to the chart image file.
        """
        if os.path.exists(chart_path):
            self.pdf.add_page()
            self.pdf.set_font("Arial", "B", 14)
            self.pdf.cell(0, 10, "Visualization", ln=True)
            self.pdf.image(chart_path, w=170)
            logger.info(f"[{self.name}] Chart added from {chart_path}")
            self.report_sections.append("Visualization")
        else:
            logger.warning(f"[{self.name}] Chart path does not exist: {chart_path}")

    def save(self, filename: str) -> str:
        """
        Save the PDF report to disk.
        
        Args:
            filename (str): The file path to save the PDF.
            
        Returns:
            str: The absolute file path where the PDF was saved.
        """
        try:
            # Ensure directory exists
            os.makedirs(os.path.dirname(os.path.abspath(filename)), exist_ok=True)
            
            # Save PDF
            self.pdf.output(filename)
            abs_path = os.path.abspath(filename)
            logger.info(f"[{self.name}] PDF saved to {abs_path}")
            return abs_path
        except Exception as e:
            logger.error(f"[{self.name}] Error saving PDF: {e}")
            # Try to save to a temporary location as backup
            temp_path = self._generate_default_filename()
            try:
                self.pdf.output(temp_path)
                logger.info(f"[{self.name}] PDF saved to backup location: {temp_path}")
                return temp_path
            except Exception as inner_e:
                logger.error(f"[{self.name}] Even backup save failed: {inner_e}")
                raise
                
    def _generate_default_filename(self) -> str:
        """
        Generate a default filename for the report.
        
        Returns:
            str: The generated filename.
        """
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        reports_dir = os.path.join(os.getcwd(), "reports")
        os.makedirs(reports_dir, exist_ok=True)
        return os.path.join(reports_dir, f"report_{timestamp}.pdf")
        
    def _cleanup_temp_files(self) -> None:
        """Clean up any temporary files created during report generation"""
        for file_path in self.temp_files:
            try:
                if os.path.exists(file_path):
                    os.unlink(file_path)
            except Exception as e:
                logger.warning(f"[{self.name}] Could not remove temp file {file_path}: {e}")
