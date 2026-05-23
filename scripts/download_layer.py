"""Download Layer.ai output URLs to local files."""
import sys
import urllib.request
import os

def download(url: str, out_path: str):
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    urllib.request.urlretrieve(url, out_path)
    print(f'Downloaded -> {out_path}')

if __name__ == '__main__':
    download(sys.argv[1], sys.argv[2])
