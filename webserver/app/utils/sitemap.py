from datetime import datetime
from typing import List, Optional

class SitemapGenerator:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip('/')
        
    def generate_url_element(
        self,
        path: str,
        lastmod: Optional[datetime] = None,
        changefreq: str = "weekly",
        priority: float = 0.8
    ) -> str:
        """Generate a single URL element for the sitemap."""
        url = f"{self.base_url}/{path.lstrip('/')}"
        
        # Start URL tag
        xml = ['<url>']
        xml.append(f'<loc>{url}</loc>')
        
        # Add last modified date if provided
        if lastmod:
            xml.append(f'<lastmod>{lastmod.strftime("%Y-%m-%d")}</lastmod>')
            
        # Add change frequency
        xml.append(f'<changefreq>{changefreq}</changefreq>')
        
        # Add priority
        xml.append(f'<priority>{priority}</priority>')
        
        # Close URL tag
        xml.append('</url>')
        
        return '\n'.join(xml)

    def generate_sitemap(self, urls: List[dict]) -> str:
        """Generate complete sitemap XML."""
        xml = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
        ]
        
        # Add each URL to the sitemap
        for url in urls:
            xml.append(self.generate_url_element(**url))
            
        # Close urlset tag
        xml.append('</urlset>')
        
        return '\n'.join(xml)
