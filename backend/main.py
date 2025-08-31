from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json

app = FastAPI(title="Roku-Style API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔹 Load categories.json
with open("categories.json") as f:
    CATEGORIES = json.load(f)

@app.get("/")
def root():
    return {"status": "ok", "endpoints": ["/categories", "/videos"]}

@app.get("/categories")
def get_categories():
    with open("categories.json") as f:
        return {"categories": json.load(f)}

@app.get("/videos")
def list_videos():
    all_videos = []
    for cat, vids in CATEGORIES.items():
        for v in vids:
            v["category"] = cat
            all_videos.append(v)
    return {"videos": all_videos}
