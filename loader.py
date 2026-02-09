import os
from pathlib import Path
from typing import List
from langchain_core.documents import Document
import pandas as pd
from langchain_community.document_loaders import UnstructuredPDFLoader

# ✅ Loaders from langchain_community
from langchain_community.document_loaders import (
    PyMuPDFLoader,                  # PDF
    UnstructuredWordDocumentLoader, # DOCX
    UnstructuredExcelLoader,        # EXCEL (XLS/XLSX)
    CSVLoader                       # CSV
)

def load_all_files(data_path: str = "docs") -> List[Document]:
    """
    Load CSV, PDF, and DOCX files from a folder or a single file.
    Returns a list of Document objects.
    """
    docs: List[Document] = []
    path = Path(data_path).resolve()

    if not path.exists():
        raise FileNotFoundError(f"❌ Path not found: {path}")

    # Collect files
    if path.is_dir():
        files_to_load = [f for f in path.iterdir() if f.is_file()]
    elif path.is_file():
        files_to_load = [path]
    else:
        raise ValueError(f"❌ Unsupported path type: {path}")

    for file in files_to_load:
        ext = file.suffix.lower()
        loader = None

        try:
            if ext == ".pdf":
                loader = PyMuPDFLoader(str(file))
                loaded_docs = loader.load()
                if not loaded_docs or all(not d.page_content.strip() for d in loaded_docs):
                    print(f"[INFO] {file.name} seems scanned. Using OCR-based loader...")
                    loader = UnstructuredPDFLoader(str(file))
                    loaded_docs = loader.load()

            elif ext == ".docx":
                loader = UnstructuredWordDocumentLoader(str(file))
            elif ext in [".xls", ".xlsx"]:
                loader = UnstructuredExcelLoader(str(file))
                loaded_docs = loader.load()
                
                # Remove blank documents
                filtered_docs = [d for d in loaded_docs if d.page_content.strip()]
                
                # Add source metadata
                for d in filtered_docs:
                    d.metadata["source"] = file.name
                
                docs.extend(filtered_docs)
                print(f"[OK] Loaded {file.name} ({len(filtered_docs)} rows)")
                continue
            
            elif ext == ".csv":
                loader = CSVLoader(file_path=str(file))
                loaded_docs = loader.load()
                # Filter out blank documents
                filtered_docs = [d for d in loaded_docs if d.page_content.strip()]
                for d in filtered_docs:
                    d.metadata["source"] = file.name
                docs.extend(filtered_docs)
                print(docs)
                print(f"[OK] Loaded {file.name} ({len(filtered_docs)} rows)")
                continue
            else:
                print(f"[SKIP] Unsupported file type: {file.name}")
                continue

            loaded_docs = loader.load()

            # Add metadata (so you know the source later)
            if ext in [".pdf", ".docx", ".xls", ".xlsx"]:
                for d in loaded_docs:
                    if "source" not in d.metadata:
                        d.metadata["source"] = file.name

            docs.extend(loaded_docs)
            print(f"[OK] Loaded {file.name} ({len(loaded_docs)} docs)")

        except Exception as e:
            print(f"[ERR] Failed to load {file.name}: {e}")
            print(f"[WARN] PyMuPDF failed for {file.name}, using OCR: {e}")
            print(f"[WARN] PyMuPDF failed for {file.name}, using OCR: {e}")
            loader = UnstructuredPDFLoader(str(file))
            loaded_docs = loader.load()
    return docs
