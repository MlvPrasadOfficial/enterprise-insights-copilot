import os
from pathlib import Path
from PyPDF2 import PdfReader

def extract_text_from_pdf(pdf_path, out_path=None):
    reader = PdfReader(pdf_path)
    text = "\n".join(page.extract_text() or "" for page in reader.pages)
    if out_path:
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(text)
    return text

def chunk_text(text, chunk_size=1000, overlap=200):
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunks.append(text[start:end])
        start += chunk_size - overlap
    return chunks

def batch_extract(folder="enterprise_insights_copilot/AA BOOKS AI", out_folder="enterprise_insights_copilot/data", chunk=False):
    os.makedirs(out_folder, exist_ok=True)
    for file in os.listdir(folder):
        if file.lower().endswith(".pdf"):
            pdf_path = os.path.join(folder, file)
            out_path = os.path.join(out_folder, file.replace(".pdf", ".txt"))
            print(f"Extracting {file}...")
            text = extract_text_from_pdf(pdf_path)
            if chunk:
                for i, chunk_text_part in enumerate(chunk_text(text)):
                    chunk_path = out_path.replace('.txt', f'_chunk{i+1}.txt')
                    with open(chunk_path, "w", encoding="utf-8") as f:
                        f.write(chunk_text_part)
                    print(f"Saved chunk to {chunk_path}")
            else:
                with open(out_path, "w", encoding="utf-8") as f:
                    f.write(text)
                print(f"Saved to {out_path}")

if __name__ == "__main__":
    batch_extract(chunk=True)
