import urllib.request
import json

try:
    req = urllib.request.Request('http://localhost:5000/api/auth/login', headers={'Content-Type': 'application/json'}, data=b'{"email":"admin@acmecorp.com","password":"admin123"}')
    res = urllib.request.urlopen(req)
    token = json.loads(res.read().decode())['access_token']

    req2 = urllib.request.Request('http://localhost:5000/api/client-needs', headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {token}'}, data=json.dumps({
      'problem_description': 'test',
      'expected_users_concurrent': 5000,
      'data_sensitivity': 'high',
      'use_cases_priority': [42, 'tool_ide'],
      'current_ia_pain_points': 'Diseño'
    }).encode('utf-8'))

    urllib.request.urlopen(req2)
    print('Success!')
except Exception as e:
    print('Error:', getattr(e, 'read', lambda: b'')().decode())
