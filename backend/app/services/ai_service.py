import os
import base64
import httpx
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models.models import AIDesignModel
from app.schemas.schemas import AIDesignCreate, AIDesign
from app.core.config import get_settings
from fastapi import HTTPException, status


class AIDesignService:
    """AI Design generation business logic."""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.design_model = AIDesignModel(db)
        self.settings = get_settings()
    
    async def generate_design(self, user_id: str, design_data: AIDesignCreate) -> AIDesign:
        """Generate AI crochet design."""
        # Create design record with pending status
        design = await self.design_model.create(user_id, design_data)
        
        try:
            # Generate based on configured AI provider
            if self.settings.AI_PROVIDER == "openai":
                image_url, description = await self._generate_with_openai(design_data.prompt)
            elif self.settings.AI_PROVIDER == "gemini":
                image_url, description = await self._generate_with_gemini(design_data.prompt)
            elif self.settings.AI_PROVIDER == "claude":
                image_url, description = await self._generate_with_claude(design_data.prompt)
            else:
                raise ValueError(f"Unknown AI provider: {self.settings.AI_PROVIDER}")
            
            # Update design with results
            update_data = {
                "status": "completed",
                "image_url": image_url,
                "description": description,
                "pattern_notes": self._extract_pattern_notes(description)
            }
            updated_design = await self.design_model.update(str(design.id), update_data)
            return updated_design or design
        
        except Exception as e:
            # Update design with error
            error_data = {
                "status": "failed",
                "error_message": str(e)
            }
            await self.design_model.update(str(design.id), error_data)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"AI generation failed: {str(e)}"
            )
    
    async def _generate_with_openai(self, prompt: str) -> tuple[str, str]:
        """Generate using OpenAI API."""
        import openai
        
        if not self.settings.OPENAI_API_KEY:
            raise ValueError("OpenAI API key not configured")
        
        client = openai.AsyncOpenAI(api_key=self.settings.OPENAI_API_KEY)
        
        # Generate description
        text_response = await client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[{
                "role": "user",
                "content": f"Design a crochet pattern based on: {prompt}\n\nProvide a brief product description and pattern notes (stitches, yarn weight, colors, difficulty)."
            }],
            max_tokens=500
        )
        description = text_response.choices[0].message.content
        
        # Generate image
        image_response = await client.images.generate(
            prompt=f"A beautiful crochet piece: {prompt}",
            model="dall-e-3",
            n=1,
            size="1024x1024"
        )
        image_url = image_response.data[0].url
        
        return image_url, description
    
    async def _generate_with_gemini(self, prompt: str) -> tuple[str, str]:
        """Generate using Google Gemini API."""
        import google.generativeai as genai
        
        if not self.settings.GEMINI_API_KEY:
            raise ValueError("Gemini API key not configured")
        
        genai.configure(api_key=self.settings.GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-pro")
        
        # Generate description
        response = await model.generate_content_async(
            f"Design a crochet pattern based on: {prompt}\n\nProvide a brief product description and pattern notes."
        )
        description = response.text
        
        # Note: Gemini doesn't generate images directly, using placeholder
        image_url = "https://via.placeholder.com/1024x1024?text=Crochet+Design"
        
        return image_url, description
    
    async def _generate_with_claude(self, prompt: str) -> tuple[str, str]:
        """Generate using Anthropic Claude API."""
        from anthropic import Anthropic
        
        if not self.settings.CLAUDE_API_KEY:
            raise ValueError("Claude API key not configured")
        
        client = Anthropic(api_key=self.settings.CLAUDE_API_KEY)
        
        # Generate description
        response = client.messages.create(
            model="claude-3-opus-20240229",
            max_tokens=500,
            messages=[{
                "role": "user",
                "content": f"Design a crochet pattern based on: {prompt}\n\nProvide a brief product description and pattern notes (stitches, yarn weight, colors, difficulty)."
            }]
        )
        description = response.content[0].text
        
        # Note: Claude doesn't generate images, using placeholder
        image_url = "https://via.placeholder.com/1024x1024?text=Crochet+Design"
        
        return image_url, description
    
    def _extract_pattern_notes(self, description: str) -> str:
        """Extract pattern notes from description."""
        # Simple extraction - look for pattern-related keywords
        lines = description.split('\n')
        pattern_lines = [line for line in lines if any(
            keyword in line.lower() for keyword in 
            ['stitch', 'yarn', 'color', 'difficulty', 'size', 'pattern']
        )]
        return ' '.join(pattern_lines) if pattern_lines else description[:200]
    
    async def get_design(self, design_id: str, user_id: str) -> AIDesign:
        """Get a specific design (verify ownership)."""
        design = await self.design_model.get_by_id(design_id)
        if not design:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Design not found"
            )
        
        if design.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this design"
            )
        
        return design
