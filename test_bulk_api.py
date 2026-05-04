#!/usr/bin/env python
import requests
import json

def test_bulk_enroll():
    # First login to get token
    login_url = 'http://127.0.0.1:8000/api/auth/login/'
    login_data = {'email': 'admin@admin.edu', 'password': 'admin123'}
    
    print('Logging in as admin...')
    try:
        r = requests.post(login_url, json=login_data)
        if r.status_code != 200:
            print(f'Login failed: {r.text}')
            return None
        token = r.json()['access']
        print('Login successful!')
    except Exception as e:
        print(f'Login error: {e}')
        return None
    
    # Test bulk-enroll
    url = 'http://127.0.0.1:8000/api/enrollments/bulk-enroll/'
    payload = {'enrollments': [{'student_id': 1, 'subject_id': 1}]}
    headers = {'Authorization': f'Bearer {token}'}

    print('\nTesting bulk-enroll API...')
    try:
        r = requests.post(url, json=payload, headers=headers)
        print(f'Status: {r.status_code}')
        if r.status_code == 201:
            response_data = r.json()
            print('Response:')
            print(json.dumps(response_data, indent=2))
            return response_data
        else:
            print(f'Error: {r.text}')
            return None
    except Exception as e:
        print(f'Error: {e}')
        return None

if __name__ == '__main__':
    test_bulk_enroll()