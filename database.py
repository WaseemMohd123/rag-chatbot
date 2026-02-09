# database.py
from pymongo import MongoClient

# Local MongoDB connection (default port 27017)
MONGO_URI = "mongodb://localhost:27017"

client = MongoClient(MONGO_URI)
db = client["langbot"]  # database name

# Collections
users_collection = db["users"]
chats_collection = db["chats"]
