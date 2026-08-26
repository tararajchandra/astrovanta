import os
from jinja2 import Environment, FileSystemLoader
try:
    from weasyprint import HTML
except ImportError:
    HTML = None

TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), "..", "templates")

def generate_pdf_report(data: dict) -> bytes:
    """
    Generates a PDF from the base_report HTML template using WeasyPrint.
    data dict should contain: astrologer_name, client_name, dob, tob, city, planets, recommendations
    """
    env = Environment(loader=FileSystemLoader(TEMPLATE_DIR))
    template = env.get_template("base_report.html")
    
    html_out = template.render(data)
    
    if HTML is None:
        raise RuntimeError("WeasyPrint is not installed or configured correctly.")
        
    pdf_bytes = HTML(string=html_out).write_pdf()
    return pdf_bytes
