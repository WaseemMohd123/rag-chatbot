# models/users.py
from datetime import datetime
from pymongo import MongoClient
from passlib.context import CryptContext
from bson import ObjectId
import os
# MongoDB connection
os.environ["TOKENIZERS_PARALLELISM"] = "false"
client = MongoClient("mongodb://localhost:27017")
db = client["chatbot_db"]
users_collection = db["users"]
sessions_collection = db["sessions"]
# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def generate_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_user(name, email, username, password):
    # Check if email or username already exists
    if users_collection.find_one({"email": email}) or users_collection.find_one({"username": username}):
        return {"error": "User already exists"}, 400

    hashed_password = generate_password_hash(password)

    user = {
        "name": name,
        "email": email,
        "username": username,
        "password": hashed_password,
        "created_at": datetime.utcnow(),
        "chats":[]
    }

    print("<----->", user)
    result = users_collection.insert_one(user)

    print(result)
    return {"message": "User registered successfully", "user_id": str(result.inserted_id)}, 200

def verify_password(plain_password,hashed_password):
    return pwd_context.verify(plain_password,hashed_password)

def login_user(email,password):
    user = users_collection.find_one({"email":email})
    if not user:
        return {"error":"Invalid email or password"},401
    
    if not verify_password(password,user["password"]):
        return{"error":"Invalid email or password"},401
    
    return{
        "message":"Login successful",
        "user_id":str(user["_id"]),
        "name":user["name"],
        "email":user["email"],
        "username":user["username"]
    },200

def create_or_get_google_user(name: str,email:str,username:str,picture:str=None):
    """
    Creates a user if not exists, else returns existing user.
    Google users will not have a password (set to None).
    """
    user = users_collection.find_one({"email":email})
    if user:
        return user 
    
    # creating new google user
    new_user = {
        "name":name,
        "email":email,
        "username":username,
        "password":None,
        "picture":picture,
        "created_at":datetime.utcnow(),
        "chats": []
    }
    result = users_collection.insert_one(new_user)
    new_user["_id"] = result.inserted_id
    return new_user

# Chat helpers 
def add_chat_to_user(user_id: str, question: str, answer: str, meta: dict = None, keep_last_n: int = 200):
    """
    Appends a chat {question, response, timestamp} to users.chats array.
    - user_id: string ObjectId
    - question, answer: strings
    - keep_last_n: if provided, keep only the last N chats (bounded array)
    """
    chat_entry = {
        "question": question,
        "answer": answer,
        "meta": meta or {},
        "timestamp": datetime.utcnow()
    }
    result = users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {
            "$push": {
                "chats": {
                    "$each": [chat_entry],
                    "$slice": -keep_last_n
                }
            }
        },
        upsert=False
    )
    # result = users_collection.update_one({"_id": ObjectId(user_id)}, update)
    # print(result)
    return result.modified_count>0

def get_user_chats(user_id: str, limit: int = None):
    """
    Retrieves chats embedded in user doc.
    Returns list of {question, response, timestamp}.
    - limit: if provided, return only last `limit` chats.
    """
    projection = {"chats": {"$slice": -limit}} if limit else {"chats": 1}
    user = users_collection.find_one({"_id": ObjectId(user_id)}, projection)
    if not user:
        return []
    return user.get("chats", [])

# chats = get_user_chats("68cb95904a046e18039dd154")
# print(chats)

def clear_user_chats(user_id: str):
    """Removes all chats for a user."""
    result = users_collection.update_one({"_id": ObjectId(user_id)}, {"$set": {"chats": []}})
    return result.modified_count

def create_sessions_indexes():
    # call once at startup to speed queries
    sessions_collection.create_index([("user_id",1),("last_active",-1)])

def create_session(user_id: str,name:str = None) -> str:
    session_docs = {
        "user_id": ObjectId(user_id),
        "name": name or f"Session {datetime.utcnow().isoformat()}",
        "status": "open",
        "created_at": datetime.utcnow(),
        "last_active": datetime.utcnow(),
        "meta": {},
        "chats": []
    }
    res = sessions_collection.insert_one(session_docs)
    return str(res.inserted_id) 

def session_belongs_to_user(session_id: str, user_id: str) -> bool:
    return sessions_collection.count_documents({
        "_id": ObjectId(session_id),
        "user_id": ObjectId(user_id)
    }) > 0

def add_message_to_session(session_id: str, sender: str, text: str, meta: dict = None, keep_last_n: int = 1000) -> bool:
    chat_entry = {
        "sender": sender,
        "text": text,
        "meta": meta or {},
        "timestamp": datetime.utcnow()
    }
    res = sessions_collection.update_one(
        {"_id": ObjectId(session_id)},
        {
            "$push": {"chats": {"$each": [chat_entry], "$slice": -keep_last_n}},
            "$set": {"last_active": datetime.utcnow()}
        }
    )
    return res.modified_count > 0

def get_sessions_for_user(user_id: str, limit: int = 50):
    cursor = sessions_collection.find({"user_id": ObjectId(user_id)}).sort("last_active", -1).limit(limit)
    sessions = []
    for s in cursor:
        s["_id"] = str(s["_id"])
        s["user_id"] = str(s["user_id"])
        # optionally return a lightweight view
        s_summary = {
            "_id": s["_id"],
            "name": s.get("name"),
            "status": s.get("status"),
            "created_at": s.get("created_at"),
            "last_active": s.get("last_active"),
            "last_message": (s.get("chats") or [])[-1] if s.get("chats") else None,
        }
        sessions.append(s_summary)
    return sessions

def get_session_chats(session_id: str, limit: int = None):
    projection = {"chats": {"$slice": -limit}} if limit else {"chats": 1}
    s = sessions_collection.find_one({"_id": ObjectId(session_id)}, projection)
    if not s:
        return []
    return s.get("chats", [])

def close_session(session_id: str) -> bool:
    res = sessions_collection.update_one(
        {"_id": ObjectId(session_id)},
        {"$set": {"status": "closed", "ended_at": datetime.utcnow(), "last_active": datetime.utcnow()}}
    )
    return res.modified_count > 0

def migrate_user_chats_to_session(user_id: str, session_name: str = "Migrated chats"):
    user = users_collection.find_one({"_id": ObjectId(user_id)})
    if not user or not user.get("chats"):
        return False
    session_doc = {
        "user_id": ObjectId(user_id),
        "name": session_name,
        "status": "closed",
        "created_at": datetime.utcnow(),
        "last_active": datetime.utcnow(),
        "chats": user.get("chats", [])
    }
    sessions_collection.insert_one(session_doc)
    users_collection.update_one({"_id": ObjectId(user_id)}, {"$set": {"chats": []}})
    return True
# ---- end sessions ----

