# import os
# import json
# from datetime import datetime
# from typing import Optional

# from flask import Flask, jsonify, request
# from flask_cors import CORS
# from werkzeug.utils import secure_filename
# from dotenv import load_dotenv

# from google import genai
# # =========================
# # ENV CONFIG
# # =========================
# load_dotenv()

# app = Flask(__name__)
# CORS(app)

# UPLOAD_FOLDER = "uploads"
# os.makedirs(UPLOAD_FOLDER, exist_ok=True)
# app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# if not GOOGLE_API_KEY:
#     raise ValueError("Missing GOOGLE_API_KEY")

# # IMPORTANT: correct SDK setup
# genai.configure(api_key=GOOGLE_API_KEY)

# MODEL_NAME = "gemini-2.5-flash"

# # =========================
# # UTILITIES
# # =========================
# def encode_image(image_path: Optional[str]):
#     if not image_path or not os.path.exists(image_path):
#         return None
#     with open(image_path, "rb") as f:
#         return {
#             "mime_type": "image/jpeg",
#             "data": f.read()
#         }

# # =========================
# # PROMPT
# # =========================
# def build_prompt(url, goal, story, aim):
#     return f"""
# You are a professional UX Audit Engine.

# Analyze: {url}

# Context:
# - Goal: {goal}
# - Story: {story}
# - Audience: {aim}

# Return STRICT JSON with:

# 4 layers:
# 1. usability
# 2. design
# 3. accessibility
# 4. behavioral

# Each layer must contain:
# - score (0-100)
# - rationale
# - strength
# - limitation
# - recommendation

# Also return:
# - overall_score (weighted average)
# - executive_summary
# """


# # =========================
# # CORE LOGIC
# # =========================
# def run_nuvia_audit(url, image_path=None, goal="", story="", aim=""):
#     prompt = build_prompt(url, goal, story, aim)

#     model = genai.GenerativeModel(MODEL_NAME)

#     image = encode_image(image_path)

#     contents = [prompt]

#     # Attach image if exists (Gemini format)
#     if image:
#         contents.append(image)

#     response = model.generate_content(
#         contents,
#         generation_config={
#             "response_mime_type": "application/json"
#         }
#     )

#     data = json.loads(response.text)

#     # =========================
#     # METADATA
#     # =========================
#     data["timestamp"] = datetime.now().isoformat()
#     data["analyzed_url"] = url

#     # =========================
#     # FRONTEND MAPPING
#     # =========================
#     data["usability_layer"] = {
#         "score": data["usability"]["score"],
#         "insights": [
#             data["usability"]["rationale"],
#             data["usability"]["strength"],
#             data["usability"]["limitation"],
#             data["usability"]["recommendation"]
#         ]
#     }

#     data["design_layer"] = {
#         "score": data["design"]["score"],
#         "insights": [
#             data["design"]["rationale"],
#             data["design"]["strength"],
#             data["design"]["limitation"],
#             data["design"]["recommendation"]
#         ]
#     }

#     data["accessibility_layer"] = {
#         "score": data["accessibility"]["score"],
#         "insights": [
#             data["accessibility"]["rationale"],
#             data["accessibility"]["strength"],
#             data["accessibility"]["limitation"],
#             data["accessibility"]["recommendation"]
#         ]
#     }

#     data["behavior_layer"] = {
#         "score": data["behavioral"]["score"],
#         "insights": [
#             data["behavioral"]["rationale"],
#             data["behavioral"]["strength"],
#             data["behavioral"]["limitation"],
#             data["behavioral"]["recommendation"]
#         ]
#     }

#     # =========================
#     # AGGREGATES
#     # =========================
#     data["strengths"] = [
#         data["usability"]["strength"],
#         data["design"]["strength"],
#         data["accessibility"]["strength"],
#         data["behavioral"]["strength"]
#     ]

#     data["critical_issues"] = [
#         data["usability"]["limitation"],
#         data["design"]["limitation"],
#         data["accessibility"]["limitation"],
#         data["behavioral"]["limitation"]
#     ]

#     data["improvements"] = [
#         {"layer": "usability", "fix": data["usability"]["recommendation"]},
#         {"layer": "design", "fix": data["design"]["recommendation"]},
#         {"layer": "accessibility", "fix": data["accessibility"]["recommendation"]},
#         {"layer": "behavior", "fix": data["behavioral"]["recommendation"]}
#     ]

#     return data


# # =========================
# # ROUTES
# # =========================
# @app.route("/audit", methods=["POST"])
# def audit():
#     url = request.form.get("url", "")
#     goal = request.form.get("goal", "")
#     story = request.form.get("story", "")
#     aim = request.form.get("aim", "")

#     image_path = None

#     if "image" in request.files:
#         file = request.files["image"]
#         if file.filename:
#             filename = secure_filename(file.filename)
#             image_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
#             file.save(image_path)

#     try:
#         result = run_nuvia_audit(url, image_path, goal, story, aim)
#         return jsonify(result)

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

import os
import json
from datetime import datetime
from typing import Optional

from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.utils import secure_filename
from dotenv import load_dotenv

from google import genai

# =========================
# ENV CONFIG
# =========================
load_dotenv()

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if not GOOGLE_API_KEY:
    raise ValueError("Missing GOOGLE_API_KEY")

# ✅ NEW SDK CLIENT
client = genai.Client(api_key=GOOGLE_API_KEY)

MODEL_NAME = "gemini-1.5-flash"

# =========================
# UTILITIES
# =========================
def encode_image(image_path: Optional[str]):
    if not image_path or not os.path.exists(image_path):
        return None
    with open(image_path, "rb") as f:
        return {
            "mime_type": "image/jpeg",
            "data": f.read()
        }

# =========================
# PROMPT
# =========================
def build_prompt(url, goal, story, aim):
    return f"""
You are a professional UX Audit Engine.

Analyze: {url}

Context:
- Goal: {goal}
- Story: {story}
- Audience: {aim}

Return STRICT JSON with:

4 layers:
1. usability
2. design
3. accessibility
4. behavioral

Each layer must contain:
- score (0-100)
- rationale
- strength
- limitation
- recommendation

Also return:
- overall_score (weighted average)
- executive_summary
"""

# =========================
# CORE LOGIC
# =========================
def run_nuvia_audit(url, image_path=None, goal="", story="", aim=""):
    prompt = build_prompt(url, goal, story, aim)

    contents = [prompt]

    # Attach image if exists
    image = encode_image(image_path)
    if image:
        contents.append(image)

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=contents,
        config={
            "response_mime_type": "application/json"
        }
    )

    data = json.loads(response.text)

    # =========================
    # METADATA
    # =========================
    data["timestamp"] = datetime.now().isoformat()
    data["analyzed_url"] = url

    # =========================
    # FRONTEND MAPPING
    # =========================
    data["usability_layer"] = {
        "score": data["usability"]["score"],
        "insights": [
            data["usability"]["rationale"],
            data["usability"]["strength"],
            data["usability"]["limitation"],
            data["usability"]["recommendation"]
        ]
    }

    data["design_layer"] = {
        "score": data["design"]["score"],
        "insights": [
            data["design"]["rationale"],
            data["design"]["strength"],
            data["design"]["limitation"],
            data["design"]["recommendation"]
        ]
    }

    data["accessibility_layer"] = {
        "score": data["accessibility"]["score"],
        "insights": [
            data["accessibility"]["rationale"],
            data["accessibility"]["strength"],
            data["accessibility"]["limitation"],
            data["accessibility"]["recommendation"]
        ]
    }

    data["behavior_layer"] = {
        "score": data["behavioral"]["score"],
        "insights": [
            data["behavioral"]["rationale"],
            data["behavioral"]["strength"],
            data["behavioral"]["limitation"],
            data["behavioral"]["recommendation"]
        ]
    }

    # =========================
    # AGGREGATES
    # =========================
    data["strengths"] = [
        data["usability"]["strength"],
        data["design"]["strength"],
        data["accessibility"]["strength"],
        data["behavioral"]["strength"]
    ]

    data["critical_issues"] = [
        data["usability"]["limitation"],
        data["design"]["limitation"],
        data["accessibility"]["limitation"],
        data["behavioral"]["limitation"]
    ]

    data["improvements"] = [
        {"layer": "usability", "fix": data["usability"]["recommendation"]},
        {"layer": "design", "fix": data["design"]["recommendation"]},
        {"layer": "accessibility", "fix": data["accessibility"]["recommendation"]},
        {"layer": "behavior", "fix": data["behavioral"]["recommendation"]}
    ]

    return data

# =========================
# ROUTES
# =========================
@app.route("/audit", methods=["POST"])
def audit():
    url = request.form.get("url", "")
    goal = request.form.get("goal", "")
    story = request.form.get("story", "")
    aim = request.form.get("aim", "")

    image_path = None

    if "image" in request.files:
        file = request.files["image"]
        if file.filename:
            filename = secure_filename(file.filename)
            image_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
            file.save(image_path)

    try:
        result = run_nuvia_audit(url, image_path, goal, story, aim)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

if __name__ == "__main__":
    app.run(debug=True,port=5000)