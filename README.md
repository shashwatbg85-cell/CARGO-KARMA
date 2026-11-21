# Cargo Karma
### Intelligent Logistics. Smarter Decisions.

Cargo Karma is an AI-powered logistics analytics and delivery risk prediction platform designed to help users explore logistics data, analyze delivery performance, and identify potential late-delivery risks.

## 1. Project Overview

Cargo Karma combines data analytics, machine learning, and explainable AI to provide insights into delivery operations.

The platform allows users to upload datasets, explore and preprocess data, analyze model performance, generate delivery risk predictions, and review previous prediction records.

**Important:** The current machine learning model is trained using the Brazilian Olist e-commerce dataset. It predicts late e-commerce delivery risk and has not been validated for Indian freight, port operations, or bulk cargo logistics.

## 2. Key Features

- **Dashboard:** View prediction statistics and system information.
- **Data Explorer:** Upload, preview, clean, preprocess, and download datasets.
- **Analytics:** Explore model performance and feature importance.
- **Explainable AI:** Examine SHAP-based feature importance.
- **Risk Prediction:** Estimate late-delivery probability.
- **Prediction History:** Review previously generated predictions.
- **Reports:** View risk distribution and export prediction records.
- **Settings:** Manage available application preferences.

## 3. Technology Stack

### Frontend
- React.js
- Vite
- JavaScript
- Axios
- Recharts
- Lucide React
- CSS

### Backend
- Python
- FastAPI
- Uvicorn

### Machine Learning
- XGBoost
- Scikit-learn
- SHAP
- Pandas
- NumPy
- Joblib

### Database
- SQLite

## 4. Machine Learning Model

The project uses an XGBoost classification model to estimate whether an eligible e-commerce order is likely to be delivered late.

### Dataset
- Dataset: Brazilian Olist E-commerce Dataset
- Modeling records: 96,470
- Features: 21
- Categorical features: 3
- Numerical features: 18

The target is based on whether the actual delivery date is later than the estimated delivery date.

Cancelled, unavailable, and non-delivered orders are excluded.

### Model Evaluation

| Metric | XGBoost |
|---|---:|
| Accuracy | 76.41% |
| Precision | 19.96% |
| Recall | 63.39% |
| F1-Score | 30.36% |
| ROC-AUC | 77.19% |
| PR-AUC | 28.45% |

The model uses an 80/20 stratified random train-test split.

**Interpretation:** The model identifies approximately 63% of actual late deliveries in the test set. Its predictions are risk estimates, not guaranteed outcomes.

## 5. Explainable AI

Cargo Karma includes SHAP-based feature importance analysis.

SHAP helps users understand which features contribute most to the model's predictions.

The current global importance analysis uses 300 test samples and reports mean absolute SHAP values.

Feature importance indicates contribution magnitude, not necessarily direction or causation.

## 6. Project Structure

```text
SupplyChainX/
│
├── backend/
│   └── main.py
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   └── App.css
│   └── package.json
│
├── models/
│   └── supplychainx_xgboost.pkl
│
├── prediction_history.db
│
└── README.md
```

## 7. Installation and Setup

### Prerequisites
- Python
- Node.js and npm
- Git (optional)

### Start the Backend

Open PowerShell:

```powershell
cd D:\SupplyChainX
.\venv\Scripts\Activate.ps1
python -m uvicorn backend.main:app --reload
```

Backend address:

```text
http://127.0.0.1:8000
```

### Start the Frontend

Open another PowerShell terminal:

```powershell
cd D:\SupplyChainX\frontend
npm run dev
```

Frontend address:

```text
http://localhost:5173
```

## 8. API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/data/upload` | Upload a dataset |
| GET | `/data/preview/{file_id}` | Preview dataset |
| GET | `/data/profile/{file_id}` | Generate data profile |
| POST | `/data/clean/{file_id}` | Clean dataset |
| POST | `/data/preprocess/{file_id}` | Preprocess dataset |
| GET | `/data/download/{file_id}` | Download processed dataset |
| GET | `/model/feature-importance` | Retrieve feature importance |
| GET | `/model/shap-importance` | Retrieve SHAP importance |
| POST | `/predict` | Generate batch predictions |
| POST | `/predict-single` | Generate a single prediction |
| GET | `/prediction-history` | Retrieve prediction history |
| GET | `/dashboard/summary` | Retrieve dashboard statistics |

## 9. Limitations

- The current model uses Brazilian e-commerce data.
- It is not trained or validated on Indian freight or port datasets.
- Training data covers purchase years 2016–2018.
- The train-test split is random and stratified, not chronological.
- Prediction probabilities are model estimates, not certainty.
- SHAP importance does not establish causation.
- Prediction history and reports currently display up to 100 records.

## 10. Future Scope

- Integration of Indian logistics and freight datasets.
- Real-time logistics data integration.
- Port and vessel analytics.
- Advanced delay forecasting.
- Improved model validation using time-based splits.
- Additional explainability and monitoring capabilities.

## 11. Project Objective

The objective of Cargo Karma is to demonstrate how machine learning, data analytics, and explainable AI can support better logistics decision-making through data-driven delivery risk analysis.

---

**Cargo Karma — Intelligent Logistics. Smarter Decisions.**