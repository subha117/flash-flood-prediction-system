from app.core.security import hash_password, verify_password


password = "TestPassword123!"

hashed = hash_password(password)

print("Password hash created:")
print(hashed)

print("Correct password:", verify_password(password, hashed))
print("Wrong password:", verify_password("WrongPassword", hashed))