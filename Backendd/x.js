fetch('/accounts/api/auth/password_reset/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'hostcomplaints@gmail.com' })
})
.then(response => response.json())
.then(data => console.log(data));