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
            # Clean and combine all content with metadata
            combined_content = []
            for content in contents:
                clean_text = self._clean_html_content(content.content)
                metadata = {
                    'id': content.id,
                    'title': content.title,
                    'author': getattr(content, 'author', 'Unknown'),
                    'date': getattr(content, 'created_at', 'Unknown'),
                    'tags': getattr(content, 'tags', [])
                }
                combined_content.append(
                    f"""
                    === Article {metadata['id']} ===
                    Title: {metadata['title']}
                    Author: {metadata['author']}
                    Date: {metadata['date']}
                    Tags: {', '.join(metadata['tags']) if metadata['tags'] else 'None'}
                    ---
                    {clean_text}
                    ---
                    """
                )
            final_context = '\n\n'.join(combined_content)

            if combined_content:
                prompt = f"""You are an expert content analyst and technical writer. 
                Analyze the following articles with these guidelines:

                ANALYSIS GUIDELINES:
                1. Focus on technical accuracy and depth
                2. Identify key patterns and relationships
                3. Extract practical implementations
                4. Highlight best practices

                ARTICLES TO ANALYZE:
                {final_context}

                SPECIFIC TASK:
                {command}

                RESPONSE REQUIREMENTS:
                1. Use clear, professional language
                2. Support claims with specific examples from articles
                3. Include relevant code snippets if present
                4. Provide actionable insights
                5. Structure response in Markdown format:

                # Summary
                [Brief overview of key findings]

                ## Best Practices & Insights
                - Recommended approaches
                - Common pitfalls
                - Performance considerations

                ## Practical Applications
                - Real-world use cases
                - Implementation steps
                - Code examples (if applicable)

                ## Key Takeaways
                - Action items
                - Next steps
                """
            else:
                prompt = f"""Task: {command}

                Please provide a detailed response following Markdown format."""
            
            if history:
                prompt = f"""Previous Context:
                {history}

                Current Analysis:
                {prompt}"""

            logging.info(f"Sending prompt to Gemini with temperature {temperature}")

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
            logging.error(f"Error processing contents with Gemini: {str(e)}")
            raise ValueError(f"Error processing contents with Gemini: {str(e)}")

