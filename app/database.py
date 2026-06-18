from pymongo import MongoClient
from app.config import MONGO_URI, DATABASE_NAME

try:
    client = MongoClient(MONGO_URI)

    client.admin.command("ping")

    print("✅ MongoDB Connected Successfully")

except Exception as e:
    print(f"❌ MongoDB Connection Failed: {e}")
    raise

db = client[DATABASE_NAME]

users_collection = db["users"]
chats_collection = db["chats"]