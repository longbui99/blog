import logging

from typing import Dict, Any, Optional, List
import google.generativeai as genai
from app.core.config import settings
from bs4 import BeautifulSoup

class GeminiService:
    instance = None
    def initialization(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-pro')
        
    def __new__(cls):
        if not cls.instance:
            cls.instance = super(GeminiService, cls).__new__(cls)
            cls.instance.initialization()
        return cls.instance

    def _clean_html_content(self, html_content: str) -> str:
        """Remove HTML tags and clean the content"""
        try:
            soup = BeautifulSoup(html_content, 'html.parser')
            for script in soup(["script", "style"]):
                script.decompose()
            text = soup.get_text()
            lines = (line.strip() for line in text.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            return ' '.join(chunk for chunk in chunks if chunk)
        except Exception as e:
            print(f"Error cleaning HTML content: {str(e)}")
            return html_content

    async def process_contents(
        self,
        contents: List[Any],
        command: str,
        temperature: Optional[float] = 0.7,
        history: Optional[List[str]] = []
    ) -> Dict[str, Any]:
        """Process multiple blog contents with Gemini"""
        try:
            # Clean and combine all content
            combined_content = []
            for content in contents:
                clean_text = self._clean_html_content(content.content)
                combined_content.append(
                    f"""
                    --- Article {content.id} ---
                    Title: {content.title}
                    Content: {clean_text}
                    """
                )
            final_context = '\n'.join(combined_content)
            if combined_content:
                prompt = f"""
                Here are multiple articles to analyze:
                
                {final_context}
                
                Command: {command}
                
                Please provide your response based on all the above content and the command.
                Consider the relationships and connections between the articles in your response.

                Response in Markdown format is a MUST but breakdown to header and content.
                """
            else:
                prompt = f"""{command}"""
            
            if history:
                prompt = f"""
                History:
                {history}

                {prompt}
                """

            logging.info(f"Prompt: {prompt}")

            # Generate response from Gemini
            response = self.model.generate_content(
                prompt,
                generation_config={
                    'temperature': temperature,
                    'top_p': 0.8,
                    'top_k': 40,
                    'max_output_tokens': 4096,
                }
            )

            return response.text

        except Exception as e:
            raise ValueError(f"Error processing contents with Gemini: {str(e)}")

