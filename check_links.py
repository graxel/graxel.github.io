
import os
import re
from urllib.parse import unquote
import sys

# Define root directory
root_dir = os.path.dirname(os.path.abspath(__file__))

class LinkChecker:
    def __init__(self, root):
        self.root = root
        self.broken_links = []
        self.checked_links = set()

    def check_file(self, file_path):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except UnicodeDecodeError:
            # Skip binary or non-utf8 files
            return

        # Find all href and src attributes
        links = re.findall(r'(?:href|src)=["\'](.*?)["\']', content)

        for link in links:
            self.check_link(link, file_path)

    def check_link(self, link, current_file):
        # Skip external links, anchors, mailto, etc.
        if link.startswith(('http:', 'https:', 'mailto:', '#', 'tel:', 'javascript:', 'ftp:')):
            return
            
        # Ignore template/jekyll placeholders
        if '{{' in link or '{%' in link:
            return

        # Normalize path
        if link.startswith('/'):
            # Absolute path from root
            target_path = os.path.join(self.root, link.lstrip('/'))
        else:
            # Relative path
            target_path = os.path.join(os.path.dirname(current_file), link)

        # Remove query params and anchors for file existence check
        clean_path = target_path.split('#')[0].split('?')[0]
        clean_path = unquote(clean_path)

        # Check if file exists
        if not os.path.exists(clean_path):
             # Try appending index.html for directory paths logic? 
             # Or maybe it's just a file that is missing extension?
             # But commonly we link to .html
             
             # Also checking if it refers to a directory with index.html
            if os.path.isdir(clean_path) and os.path.exists(os.path.join(clean_path, 'index.html')):
                return
            
            # Special logic for this project: 
            # if link ends in .html, check if .md exists (Jekyll source)
            if clean_path.endswith('.html'):
                md_path = clean_path[:-5] + '.md'
                if os.path.exists(md_path):
                    return
            
            self.broken_links.append((current_file, link))

    def run(self):
        for dirpath, dirnames, filenames in os.walk(self.root):
            # Skip .git, _site, etc if needed. 
            if '.git' in dirpath:
                continue

            for filename in filenames:
                if filename.endswith('.html'):
                    self.check_file(os.path.join(dirpath, filename))

        if self.broken_links:
            print("Found broken links:")
            current_file = ""
            for file, link in self.broken_links:
                rel_file = os.path.relpath(file, self.root)
                if rel_file != current_file:
                    print(f"\nIn file: {rel_file}")
                    current_file = rel_file
                print(f"  - {link}")
        else:
            print("No broken links found!")

if __name__ == "__main__":
    checker = LinkChecker(root_dir)
    checker.run()
