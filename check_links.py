"""Check if all links in a set of HTML pages are valid"""
import os
import fnmatch
import requests

from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from concurrent.futures import ThreadPoolExecutor


def find_html_files(top_dir: str):
    """Find all .html and .htm files starting from the top-level directory."""
    html_files = []
    for root, dirs, files in os.walk(top_dir):
        for file in files:
            if fnmatch.fnmatch(file, '*.html') or fnmatch.fnmatch(file, '*.htm'):
                html_files.append(os.path.join(root, file))
    return html_files


def fetch_html(url: str):
    """Fetch the HTML content of a given URL."""
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.text
    except requests.RequestException as e:
        print(f"Error fetching {url}: {e}")
        return None


def extract_links(html, base_url):
    """Extract all links from the given HTML content."""
    soup = BeautifulSoup(html, 'html.parser')
    links = []
    for tag in soup.find_all('a', href=True):
        link = urljoin(base_url, tag['href'])
        if urlparse(link).scheme in ['http', 'https']:
            links.append(link)
    return links


def check_link(url: str, timeout=5):
    """Check if a link is valid by making a HEAD request."""
    try:
        response = requests.head(url, allow_redirects=True, timeout=timeout)
        if response.status_code < 400:
            return (url, True)
        else:
            return (url, False)
    except requests.RequestException:
        return (url, False)


def validate_links(url, max_workers=10) -> list:
    """Fetch the HTML, extract links, and validate them."""
    html = fetch_html(url)
    if not html:
        return []

    links = extract_links(html, url)
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        return list(executor.map(check_link, links))


def find_unused_port():
    import socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('', 0))
        return s.getsockname()[1]


class LinkChecker:

    def __init__(self, top_dir: str):
        self.top_dir = top_dir
        self.html_files = find_html_files(top_dir)
        print(f"Found {len(self.html_files)} .html|.htm files starting from {top_dir=}")

    def check_with_endpoint(self, endpoint: str) -> int:
        urls = [endpoint + f for f in self.html_files]
        cnt = 0
        for url in urls:
            print(f"Checking links in {url}")
            results = validate_links(url)
            for link, is_valid in results:
                status = "Valid" if is_valid else "Broken"
                print(f"{link}: {status}")
                if not is_valid:
                    cnt += 1
        return cnt

    def start_server_and_check(self, host="127.0.0.1") -> int:
        import subprocess
        import time
        port = find_unused_port()
        endpoint = f"http://{host}:{port}/"

        cmd = f"python -m http.server {port} --bind {host}"
        stdout_file, stderr_file = "web_server.stdout", "web_server.stderr"
        print("Starting webserver with command", cmd)
        print("Redirecting webserver stdout and stderr to: ", stdout_file, stderr_file)

        with open(stdout_file, 'w') as stdout, open(stderr_file, 'w') as stderr:
            args = cmd.split(" ")
            server_process = subprocess.Popen(args, start_new_session=True, stdout=stdout, stderr=stderr)

        # Give the server a moment to start
        time.sleep(2)

        try:
            return self.check_with_endpoint(endpoint)
        finally:
            print("Terminating the server subprocess...")
            server_process.terminate()
            server_process.wait()


def main():
    # List of URLs to check
    import os
    endpoint = "http://127.0.0.1:8000/"
    checker = LinkChecker(".")
    #num_errors = checker.check_with_endpoint(endpoint)
    num_errors = checker.start_server_and_check()
    return num_errors


if __name__ == "__main__":
    import sys
    sys.exit(main())

