"""Two-step resumable upload to a Layer.ai signed URL."""
import sys
import urllib.request

def upload(signed_url: str, file_path: str, content_type: str = 'image/png'):
    with open(file_path, 'rb') as f:
        data = f.read()
    file_size = len(data)

    # Step 1: initiate resumable upload
    req = urllib.request.Request(
        signed_url,
        method='POST',
        headers={
            'Content-Type': content_type,
            'x-goog-resumable': 'start',
            'x-goog-content-length-range': f'0,{file_size}',
            'Content-Length': '0',
        },
        data=b'',
    )
    with urllib.request.urlopen(req) as resp:
        if resp.status != 201:
            raise RuntimeError(f'Step 1 failed: {resp.status}')
        session_uri = resp.headers.get('Location')
    if not session_uri:
        raise RuntimeError('No Location header from step 1')

    # Step 2: upload bytes
    req2 = urllib.request.Request(
        session_uri,
        method='PUT',
        headers={'Content-Type': content_type},
        data=data,
    )
    with urllib.request.urlopen(req2) as resp:
        if resp.status not in (200, 201):
            raise RuntimeError(f'Step 2 failed: {resp.status}')
    print(f'Uploaded {file_path} ({file_size} bytes)')

if __name__ == '__main__':
    upload(sys.argv[1], sys.argv[2])
