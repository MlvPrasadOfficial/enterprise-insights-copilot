"""
ReportGenerator: Utility for building PDF reports with insights and charts.
"""

from fpdf import FPDF
import datetime
import os
from backend.core.logging import logger
from typing import Optional

class ReportGenerator:
    def __init__(self, title: str = "Enterprise Insights Report"):
        """
        Initialize the ReportGenerator.
        Args:
            title (str): The title for the report.
        """
        self.pdf = FPDF()
        self.pdf.set_auto_page_break(auto=True, margin=15)
        self.title = title
        logger.info(f"[ReportGenerator] Initialized with title: {title}")

    def add_title(self) -> None:
        """
        Add the title and timestamp to the PDF report.
        """
        self.pdf.add_page()
        self.pdf.set_font("Arial", 'B', 16)
        self.pdf.cell(0, 10, self.title, ln=True, align='C')
        self.pdf.set_font("Arial", '', 12)
        self.pdf.cell(0, 10, f"Generated on: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}", ln=True)
        logger.info("[ReportGenerator] Title and timestamp added.")

    def add_insight_section(self, insight_text: str) -> None:
        """
        Add a section with key insights to the PDF report.
        Args:
            insight_text (str): The insights text to include.
        """
        self.pdf.set_font("Arial", 'B', 14)
        self.pdf.cell(0, 10, "Key Insights", ln=True)
        self.pdf.set_font("Arial", '', 12)
        self.pdf.multi_cell(0, 8, insight_text)
        logger.info("[ReportGenerator] Insight section added.")

    def add_chart(self, chart_path: str) -> None:
        """
        Add a chart image to the PDF report if the file exists.
        Args:
            chart_path (str): Path to the chart image file.
        """
        if os.path.exists(chart_path):
            self.pdf.set_font("Arial", 'B', 14)
            self.pdf.cell(0, 10, "Visualization", ln=True)
            self.pdf.image(chart_path, w=170)
            logger.info(f"[ReportGenerator] Chart added from {chart_path}.")
        else:
            logger.warning(f"[ReportGenerator] Chart path does not exist: {chart_path}")

    def save(self, filename: str) -> str:
        """
        Save the PDF report to disk.
        Args:
            filename (str): The file path to save the PDF.
        Returns:
            str: The file path where the PDF was saved.
        """
        self.pdf.output(filename)
        logger.info(f"[ReportGenerator] PDF saved to {filename}.")
        return filename
