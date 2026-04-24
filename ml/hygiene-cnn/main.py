from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
import numpy as np
from PIL import Image
import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

base_model = tf.keras.applications.MobileNetV2(
    weights="imagenet",
    include_top=False,
    input_shape=(224, 224, 3)
)
base_model.trainable = False

model = tf.keras.Sequential([
    base_model,
    tf.keras.layers.GlobalAveragePooling2D(),
    tf.keras.layers.Dense(128, activation="relu"),
    tf.keras.layers.Dropout(0.3),
    tf.keras.layers.Dense(1, activation="sigmoid")
])

def preprocess(image_bytes):
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize((224, 224))
    arr = np.array(img) / 255.0
    arr = np.expand_dims(arr, axis=0)
    return arr.astype(np.float32)

def mock_hygiene_score(image_bytes):
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    arr = np.array(img)
    brightness = arr.mean() / 255.0
    score = float(np.clip(brightness * 1.2, 0.3, 0.95))
    return round(score, 2)

@app.get("/health")
def health():
    return {"status": "ok", "service": "hygiene-cnn"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()
    score = mock_hygiene_score(contents)
    if score >= 0.75:
        status = "approved"
        message = "Food looks clean and well presented"
    elif score >= 0.5:
        status = "review"
        message = "Food needs manual review"
    else:
        status = "rejected"
        message = "Food does not meet hygiene standards"
    return {
        "hygieneScore": score,
        "status": status,
        "message": message
    }

from pydantic import BaseModel
import urllib.request

class ImageURL(BaseModel):
    imageUrl: str

@app.post("/predict-url")
async def predict_url(body: ImageURL):
    with urllib.request.urlopen(body.imageUrl) as response:
        contents = response.read()
    score = mock_hygiene_score(contents)
    if score >= 0.75:
        status = "approved"
        message = "Food looks clean and well presented"
    elif score >= 0.5:
        status = "review"
        message = "Food needs manual review"
    else:
        status = "rejected"
        message = "Food does not meet hygiene standards"
    return {
        "hygieneScore": score,
        "status": status,
        "message": message
    }