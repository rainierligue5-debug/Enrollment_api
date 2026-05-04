#!/usr/bin/env python
import requests
import json

url = 'http://127.0.0.1:8000/api/enrollments/bulk-enroll/'
payload = {
    'enrollments': [
        {'student_id': 1, 'subject_id': 1},
        {'student_id': 2, 'subject_id': 2}
    ]
}

print("Testing bulk-enroll endpoint...")
print(f"URL: {url}")
print(f"Payload: {json.dumps(payload, indent=2)}")
print()

r = requests.post(url, json=payload)
print(f'Status Code: {r.status_code}')
print(f'Response Headers:')
for key, value in r.headers.items():
    print(f'  {key}: {value}')
print()
print(f'Response Body:')
print(r.text)
