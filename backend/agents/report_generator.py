from fpdf import FPDF
import datetime
import os

class ReportGenerator:
    def __init__(self, title="Enterprise Insights Report"):
        self.pdf = FPDF()
        self.pdf.set_auto_page_break(auto=True, margin=15)
        self.title = title

    def add_title(self):
        self.pdf.add_page()
        self.pdf.set_font("Arial", 'B', 16)
        self.pdf.cell(0, 10, self.title, ln=True, align='C')
        self.pdf.set_font("Arial", '', 12)
        self.pdf.cell(0, 10, f"Generated on: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}", ln=True)

    def add_insight_section(self, insight_text: str):
        self.pdf.set_font("Arial", 'B', 14)
        self.pdf.cell(0, 10, "Key Insights", ln=True)
        self.pdf.set_font("Arial", '', 12)
        self.pdf.multi_cell(0, 8, insight_text)

    def add_chart(self, chart_path: str):
        if os.path.exists(chart_path):
            self.pdf.set_font("Arial", 'B', 14)
            self.pdf.cell(0, 10, "Visualization", ln=True)
            self.pdf.image(chart_path, w=170)

    def save(self, filename: str):
        self.pdf.output(filename)
        return filename
