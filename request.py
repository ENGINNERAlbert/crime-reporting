import requests

API_KEY = "AIzaSyAfYEaHR33oSgYA9c1MF3mU7xQkpw8F7UE" 

email = "testuser1@gmail.com"
password = "testuser1"

url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={API_KEY}"
data = {
    "email": email,
    "password": password,
    "returnSecureToken": True
}

response = requests.post(url, json=data)
token = response.json().get("idToken")

if token:
    print("Firebase ID Token:", token)
else:
    print("Error:", response.json())
