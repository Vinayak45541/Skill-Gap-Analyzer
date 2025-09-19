import sys
import pdfplumber

pdf_path = sys.argv[1]

with pdfplumber.open(pdf_path) as pdf:
    text = ""
    for page in pdf.pages:
        text += page.extract_text() + "\n"

print(text)
