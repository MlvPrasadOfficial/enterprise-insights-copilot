from fpdf import FPDF
import datetime
import os
from backend.core.logging import logger

class ReportGenerator:
    def __init__(self, title="Enterprise Insights Report"):
        self.pdf = FPDF()
        self.pdf.set_auto_page_break(auto=True, margin=15)
        self.title = title
        logger.info(f"[ReportGenerator] Initialized with title: {title}")

    def add_title(self):
        self.pdf.add_page()
        self.pdf.set_font("Arial", 'B', 16)
        self.pdf.cell(0, 10, self.title, ln=True, align='C')
        self.pdf.set_font("Arial", '', 12)
        self.pdf.cell(0, 10, f"Generated on: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}", ln=True)
        logger.info("[ReportGenerator] Title and timestamp added.")

    def add_insight_section(self, insight_text: str):
        self.pdf.set_font("Arial", 'B', 14)
        self.pdf.cell(0, 10, "Key Insights", ln=True)
        self.pdf.set_font("Arial", '', 12)
        self.pdf.multi_cell(0, 8, insight_text)
        logger.info("[ReportGenerator] Insight section added.")

    def add_chart(self, chart_path: str):
        if os.path.exists(chart_path):
            self.pdf.set_font("Arial", 'B', 14)
            self.pdf.cell(0, 10, "Visualization", ln=True)
            self.pdf.image(chart_path, w=170)
            logger.info(f"[ReportGenerator] Chart added from {chart_path}.")
        else:
            logger.warning(f"[ReportGenerator] Chart path does not exist: {chart_path}")

    def save(self, filename: str):
        self.pdf.output(filename)
        logger.info(f"[ReportGenerator] PDF saved to {filename}.")
        return filename
