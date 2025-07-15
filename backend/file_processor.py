import base64
import io
from typing import Optional
import PyPDF2
from docx import Document
import tempfile
import os

class FileProcessor:
    """Process various file types and extract text content"""
    
    @staticmethod
    def extract_text_from_base64(file_content: str, file_type: str) -> Optional[str]:
        """Extract text from base64 encoded file"""
        try:
            # Decode base64 content
            file_data = base64.b64decode(file_content)
            
            if file_type.lower() == 'pdf':
                return FileProcessor._extract_from_pdf(file_data)
            elif file_type.lower() in ['docx', 'doc']:
                return FileProcessor._extract_from_docx(file_data)
            elif file_type.lower() == 'txt':
                return file_data.decode('utf-8')
            else:
                raise ValueError(f"Unsupported file type: {file_type}")
                
        except Exception as e:
            print(f"Error extracting text from {file_type}: {e}")
            return None
    
    @staticmethod
    def _extract_from_pdf(file_data: bytes) -> str:
        """Extract text from PDF file data"""
        try:
            pdf_file = io.BytesIO(file_data)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            
            return text.strip()
        except Exception as e:
            print(f"Error extracting PDF text: {e}")
            return ""
    
    @staticmethod
    def _extract_from_docx(file_data: bytes) -> str:
        """Extract text from DOCX file data"""
        try:
            # Create a temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix='.docx') as temp_file:
                temp_file.write(file_data)
                temp_file_path = temp_file.name
            
            # Extract text from docx
            doc = Document(temp_file_path)
            text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
            
            # Clean up temporary file
            os.unlink(temp_file_path)
            
            return text.strip()
        except Exception as e:
            print(f"Error extracting DOCX text: {e}")
            return ""
    
    @staticmethod
    def validate_file_size(file_content: str, max_size_mb: int = 100) -> bool:
        """Validate file size (base64 encoded)"""
        try:
            # Calculate approximate file size from base64
            file_size_bytes = len(file_content) * 3 / 4  # Base64 overhead
            max_size_bytes = max_size_mb * 1024 * 1024
            
            return file_size_bytes <= max_size_bytes
        except Exception:
            return False
    
    @staticmethod
    def get_supported_formats():
        """Get list of supported file formats"""
        return ['pdf', 'docx', 'doc', 'txt']