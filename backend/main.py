from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import pandas as pd
import numpy as np
import joblib
import io
import uuid
import sqlite3
from datetime import datetime
from fastapi import Form
from pydantic import BaseModel, Field
from fastapi.responses import FileResponse
from sklearn.preprocessing import StandardScaler

# Initialize FastAPI
app = FastAPI(
    title="Cargo Karma API",
    description="AI-Based Supply Chain Risk Prediction API",
    version="1.0"
)

# Allow React frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Load trained model
BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = BASE_DIR / "models" / "supplychainx_xgboost.pkl"

bundle = joblib.load(MODEL_PATH)

model = bundle["model"]
feature_columns = bundle["feature_columns"]
# ==============================
# PREDICTION HISTORY DATABASE
# ==============================

DB_PATH = BASE_DIR / "prediction_history.db"


def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def initialize_database():
    conn = get_db_connection()

    conn.execute("""
        CREATE TABLE IF NOT EXISTS prediction_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            prediction_time TEXT NOT NULL,
            customer_state TEXT,
            product_category TEXT,
            late_delivery_probability REAL,
            risk_level TEXT,
            model_name TEXT
        )
    """)

    conn.commit()
    conn.close()


initialize_database()

# Single Order Prediction Input Model

class PredictionInput(BaseModel):

    customer_state: str

    Total_Items: float
    Total_Price: float
    Total_Freight: float
    Average_Price: float
    Unique_Products: float
    Unique_Sellers: float

    Product_Weight: float
    Product_Length: float
    Product_Height: float
    Product_Width: float

    Seller_State: str
    Product_Category: str

    Total_Payment: float
    Payment_Installments: float
    Payment_Methods: float

    Purchase_Year: float
    Purchase_Month: float
    Purchase_Day: float
    Purchase_Hour: float
    Purchase_Weekday: float

# Home API
@app.get("/")
def home():
    return {
        "message": "Welcome to Cargo Karma API",
        "status": "Running"
    }


# Model information
@app.get("/model-info")
def model_info():
    return {
        "model": "XGBoost",
        "features": len(feature_columns),
        "prediction": "Late Delivery Risk"
    }


# CSV Prediction API
@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Please upload a CSV file."
        )

    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))

        missing_columns = [
            col for col in feature_columns
            if col not in df.columns
        ]

        if missing_columns:
            raise HTTPException(
                status_code=400,
                detail=f"Missing columns: {missing_columns}"
            )

        input_data = df[feature_columns]

        probabilities = model.predict_proba(input_data)[:, 1]

        predictions = (probabilities >= 0.5).astype(int)

        results = pd.DataFrame({
            "Late_Delivery_Probability": (
                probabilities * 100
            ).round(2),
            "Prediction": predictions,
            "Risk_Level": [
                "High Risk" if p == 1 else "Low Risk"
                for p in predictions
            ]
        })

        results = results.replace({np.nan: None})

        return {
            "total_orders": len(results),
            "high_risk_orders": int((predictions == 1).sum()),
            "low_risk_orders": int((predictions == 0).sum()),
            "predictions": results.to_dict(orient="records")
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
# ==========================================
# CARGO KARMA - DATA EXPLORER
# ==========================================

EXPLORER_DIR = BASE_DIR / "data" / "processed" / "explorer"
EXPLORER_DIR.mkdir(parents=True, exist_ok=True)


def get_dataset_path(file_id: str):
    if not file_id.isalnum():
        raise HTTPException(status_code=400, detail="Invalid file ID")

    path = EXPLORER_DIR / f"{file_id}.csv"

    if not path.exists():
        raise HTTPException(status_code=404, detail="Dataset not found")

    return path


@app.post("/data/upload")
async def upload_dataset(file: UploadFile = File(...)):

    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Only CSV files are supported"
        )

    content = await file.read()

    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail="Maximum file size is 10 MB"
        )

    try:
        df = pd.read_csv(io.BytesIO(content))

        if df.empty or len(df.columns) == 0:
            raise ValueError("CSV is empty")

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Unable to read CSV file"
        )

    file_id = uuid.uuid4().hex

    file_path = EXPLORER_DIR / f"{file_id}.csv"
    df.to_csv(file_path, index=False)

    return {
        "message": "Dataset uploaded successfully",
        "file_id": file_id,
        "filename": file.filename,
        "total_rows": len(df),
        "total_columns": len(df.columns)
    }


@app.get("/data/preview/{file_id}")
def dataset_preview(file_id: str):

    path = get_dataset_path(file_id)
    df = pd.read_csv(path)

    return {
        "columns": df.columns.tolist(),
        "rows": df.head(10).replace({np.nan: None}).to_dict(
            orient="records"
        )
    }


@app.get("/data/profile/{file_id}")
def dataset_profile(file_id: str):

    path = get_dataset_path(file_id)
    df = pd.read_csv(path)

    missing = df.isnull().sum()

    return {
        "total_rows": len(df),
        "total_columns": len(df.columns),
        "missing_values": int(missing.sum()),
        "duplicate_rows": int(df.duplicated().sum()),
        "column_details": [
            {
                "column": col,
                "data_type": str(df[col].dtype),
                "missing": int(df[col].isnull().sum()),
                "unique_values": int(df[col].nunique())
            }
            for col in df.columns
        ]
    }


@app.post("/data/clean/{file_id}")
def clean_dataset(
    file_id: str,
    remove_duplicates: bool = True,
    missing_strategy: str = "keep"
):

    path = get_dataset_path(file_id)
    df = pd.read_csv(path)

    if missing_strategy not in ["keep", "drop_rows", "fill_median", "fill_mode"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid missing value strategy"
        )

    original_rows = len(df)
    original_duplicates = int(df.duplicated().sum())

    if remove_duplicates:
        df = df.drop_duplicates()

    if missing_strategy == "drop_rows":
        df = df.dropna()

    elif missing_strategy == "fill_median":
        for col in df.select_dtypes(include="number").columns:
            df[col] = df[col].fillna(df[col].median())

    elif missing_strategy == "fill_mode":
        for col in df.columns:
            if not df[col].mode().empty:
                df[col] = df[col].fillna(df[col].mode()[0])

    df.to_csv(path, index=False)

    return {
        "message": "Dataset cleaned successfully",
        "original_rows": original_rows,
        "cleaned_rows": len(df),
        "duplicates_removed": original_duplicates if remove_duplicates else 0,
        "remaining_missing_values": int(df.isnull().sum().sum())
    }


@app.post("/data/preprocess/{file_id}")
def preprocess_dataset(file_id: str):

    path = get_dataset_path(file_id)
    df = pd.read_csv(path)

    numeric_columns = df.select_dtypes(include="number").columns.tolist()
    categorical_columns = df.select_dtypes(
        include=["object", "category"]
    ).columns.tolist()

    if numeric_columns:
        df[numeric_columns] = df[numeric_columns].fillna(
            df[numeric_columns].median()
        )

        scaler = StandardScaler()
        df[numeric_columns] = scaler.fit_transform(
            df[numeric_columns]
        )

    if categorical_columns:
        df = pd.get_dummies(
            df,
            columns=categorical_columns,
            dtype=int
        )

    df.to_csv(path, index=False)

    return {
        "message": "Dataset preprocessing completed",
        "total_rows": len(df),
        "total_features": len(df.columns),
        "features": df.columns.tolist()
    }


@app.get("/data/download/{file_id}")
def download_dataset(file_id: str):

    path = get_dataset_path(file_id)

    return FileResponse(
        path,
        media_type="text/csv",
        filename="cargo_karma_processed.csv"
    )

@app.get("/model/feature-importance")
def get_feature_importance():
    import pandas as pd
    from pathlib import Path
    from fastapi import HTTPException

    BASE_DIR = Path(__file__).resolve().parent.parent
    file_path = BASE_DIR / "reports" / "feature_importance.csv"

    if not file_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Feature importance file not found"
        )

    df = pd.read_csv(file_path)

    if not {"Feature", "Importance"}.issubset(df.columns):
        raise HTTPException(
            status_code=400,
            detail="Invalid CSV format"
        )

    df = df.sort_values(
        by="Importance",
        ascending=False
    ).head(15)

    return {
        "total_features": len(df),
        "features": df.to_dict(orient="records")
    }

@app.get("/model/shap-importance")
def get_shap_importance():
    import pandas as pd
    from fastapi import HTTPException

    BASE_DIR = Path(__file__).resolve().parent.parent
    file_path = BASE_DIR / "reports" / "shap_importance.csv"

    if not file_path.exists():
        raise HTTPException(
            status_code=404,
            detail="SHAP importance file not found"
        )

    df = pd.read_csv(file_path)

    if not {"Feature", "SHAP_Importance"}.issubset(df.columns):
        raise HTTPException(
            status_code=400,
            detail="Invalid SHAP CSV format"
        )

    df = df.sort_values(
        by="SHAP_Importance",
        ascending=False
    ).head(15)

    return {
        "total_features": len(df),
        "features": df.to_dict(orient="records")
    }

    # Single Order Prediction API

@app.post("/predict-single")
async def predict_single_order(payload: PredictionInput):

    try:
        # Convert input into dictionary
        input_data = payload.dict()

        # Create DataFrame with exact model feature order
        input_df = pd.DataFrame(
            [input_data],
            columns=feature_columns
        )

        # Predict late delivery probability
        probability = model.predict_proba(input_df)[0][1]

        # Apply prediction threshold
        prediction = int(probability >= 0.5)

        # Determine risk level
        risk_level = (
            "High Risk" if prediction == 1 else "Low Risk"
        )
        # Save prediction to database
        conn = get_db_connection()

        conn.execute(
            """
            INSERT INTO prediction_history (
                prediction_time,
                customer_state,
                product_category,
                late_delivery_probability,
                risk_level,
                model_name
            )
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                payload.customer_state,
                payload.Product_Category,
                round(float(probability * 100), 2),
                risk_level,
                "XGBoost"
            )
        )

        conn.commit()
        conn.close()

        return {
            "success": True,
            "prediction": prediction,
            "risk_level": risk_level,
            "late_delivery_probability": round(
                float(probability * 100), 2
            ),
            "message": (
                "Order has a high risk of late delivery."
                if prediction == 1
                else "Order has a low risk of late delivery."
            ),
            "model": "XGBoost"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# ==============================
# PREDICTION HISTORY API
# ==============================

@app.get("/prediction-history")
def get_prediction_history():
    conn = None
    try:
        conn = get_db_connection()
        records = conn.execute(
            """
            SELECT id, prediction_time, customer_state,
                   product_category, late_delivery_probability,
                   risk_level, model_name
            FROM prediction_history
            ORDER BY id DESC
            LIMIT 100
            """
        ).fetchall()

        return {
            "success": True,
            "total_records": len(records),
            "history": [dict(record) for record in records]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn is not None:
            conn.close()


# ==============================
# OVERVIEW DASHBOARD SUMMARY API
# ==============================

@app.get("/dashboard/summary")
def get_dashboard_summary():
    conn = None
    try:
        conn = get_db_connection()
        totals = conn.execute(
            """
            SELECT
                COUNT(*) AS total_predictions,
                SUM(CASE WHEN LOWER(COALESCE(risk_level, '')) = 'high risk' THEN 1 ELSE 0 END) AS high_risk_predictions,
                SUM(CASE WHEN LOWER(COALESCE(risk_level, '')) = 'low risk' THEN 1 ELSE 0 END) AS low_risk_predictions,
                AVG(late_delivery_probability) AS average_late_probability
            FROM prediction_history
            """
        ).fetchone()
        recent = conn.execute(
            """
            SELECT id, prediction_time, customer_state, product_category,
                   late_delivery_probability, risk_level, model_name
            FROM prediction_history
            ORDER BY id DESC
            LIMIT 5
            """
        ).fetchall()
        return {
            "success": True,
            "total_predictions": int(totals["total_predictions"] or 0),
            "high_risk_predictions": int(totals["high_risk_predictions"] or 0),
            "low_risk_predictions": int(totals["low_risk_predictions"] or 0),
            "average_late_probability": round(float(totals["average_late_probability"] or 0), 2),
            "recent_predictions": [dict(row) for row in recent],
            "data_source": "Cargo Karma saved prediction history"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn is not None:
            conn.close()
