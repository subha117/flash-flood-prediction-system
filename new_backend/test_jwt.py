from app.core.security import create_access_token


token = create_access_token(
    {"sub": "1"}
)

print("JWT created:")
print(token)