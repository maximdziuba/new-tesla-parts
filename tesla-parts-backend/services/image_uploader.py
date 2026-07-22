import os
import uuid
from pathlib import Path
from fastapi import UploadFile
from typing import Optional

class ImageUploader:
    def __init__(self):
        self.base_url = os.getenv("BACKEND_URL", "http://127.0.0.1:8000")
    
    async def upload_image(self, file: UploadFile, folder: str = "tesla-parts") -> Optional[str]:
        """
        Upload an image file and return its URL.
        
        Args:
            file: FastAPI UploadFile object
            folder: Folder path for organization (e.g., "tesla-parts/products")
        
        Returns:
            URL string of the uploaded image, or None if upload fails
        """
        if not file.filename:
            return None
        
        try:
            return await self._upload_to_local(file, folder)
        except Exception as e:
            print(f"Error uploading image: {e}")
            return None
    
    async def _upload_to_local(self, file: UploadFile, folder: str) -> str:
        """Upload image to local storage."""
        # Create directory structure
        upload_dir = Path("static") / "images" / folder
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate unique filename
        file_ext = Path(file.filename).suffix if file.filename else ".jpg"
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        file_path = upload_dir / unique_filename
        
        # Save file
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
        
        # Return URL
        # Remove leading slash from base_url if present, and ensure folder path is correct
        base_url = self.base_url.rstrip("/")
        file_location = f"static/images/{folder}/{unique_filename}"
        return f"{base_url}/{file_location}"

# Create singleton instance
image_uploader = ImageUploader()
