import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  LayoutDashboard,
  BrainCircuit,
  ChartNoAxesCombined,
  ShieldAlert,
  FileText,
  Settings,
  Bell,
  Search,
  Truck,
  Package,
  TrendingUp,
  Activity,
  Upload,
  ArrowUpRight,
  Database,
  Download,
  Sparkles,
  Trash2,
  RefreshCw,
  History as HistoryIcon,
  Wifi,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  Info,
  SlidersHorizontal,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import "./App.css";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function App() {
  const [activePage, setActivePage] = useState("Overview");
  const [apiStatus, setApiStatus] = useState("idle");
  const [apiCheckedAt, setApiCheckedAt] = useState("");
  const [settingsMessage, setSettingsMessage] = useState("");
  const [preferences, setPreferences] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("cargoKarmaPreferences") || "{}");
      return {
        showModelDisclaimer: saved.showModelDisclaimer ?? true,
        confirmBeforeReset: saved.confirmBeforeReset ?? true,
        compactTables: saved.compactTables ?? false,
      };
    } catch {
      return { showModelDisclaimer: true, confirmBeforeReset: true, compactTables: false };
    }
  });

  const checkApiConnection = async () => {
    setApiStatus("checking");
    try {
      await axios.get(`${API}/`);
      setApiStatus("online");
    } catch (err) {
      setApiStatus("offline");
    } finally {
      setApiCheckedAt(new Date().toLocaleString());
    }
  };

  const savePreferences = () => {
    localStorage.setItem("cargoKarmaPreferences", JSON.stringify(preferences));
    setSettingsMessage("Preferences saved on this device.");
    window.setTimeout(() => setSettingsMessage(""), 3000);
  };

  const resetPreferences = () => {
    const defaults = { showModelDisclaimer: true, confirmBeforeReset: true, compactTables: false };
    setPreferences(defaults);
    localStorage.setItem("cargoKarmaPreferences", JSON.stringify(defaults));
    setSettingsMessage("Preferences restored to defaults.");
    window.setTimeout(() => setSettingsMessage(""), 3000);
  };
  // Sidebar Navigation Items
const navigation = [
  { name: "Overview", icon: LayoutDashboard },
  { name: "Data Explorer", icon: Database },
  { name: "Analytics", icon: ChartNoAxesCombined },
  { name: "Explainable AI", icon: ShieldAlert },
  { name: "Risk Prediction", icon: BrainCircuit },
  { name: "Prediction History", icon: HistoryIcon },
  { name: "Reports", icon: FileText },
];

  const [file, setFile] = useState(null);
  const [fileId, setFileId] = useState("");
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  // Analytics states
const [featureImportance, setFeatureImportance] = useState([]);
const [analyticsLoading, setAnalyticsLoading] = useState(false);
const [analyticsError, setAnalyticsError] = useState("");
// Explainable AI - SHAP states
const [shapImportance, setShapImportance] = useState([]);
const [shapLoading, setShapLoading] = useState(false);
const [shapError, setShapError] = useState("");

// Risk Prediction States
const [predictionData, setPredictionData] = useState({
  customer_state: "SP",
  Total_Items: 1,
  Total_Price: 86.5,
  Total_Freight: 17.17,
  Average_Price: 79,
  Unique_Products: 1,
  Unique_Sellers: 1,
  Product_Weight: 700,
  Product_Length: 25,
  Product_Height: 13,
  Product_Width: 20,
  Seller_State: "SP",
  Product_Category: "perfumaria",
  Total_Payment: 105.28,
  Payment_Installments: 2,
  Payment_Methods: 1,
  Purchase_Year: 2018,
  Purchase_Month: 6,
  Purchase_Day: 15,
  Purchase_Hour: 15,
  Purchase_Weekday: 3
});

const [predictionResult, setPredictionResult] = useState(null);
const [predictionLoading, setPredictionLoading] = useState(false);
const [predictionError, setPredictionError] = useState("");
const [predictionHistory, setPredictionHistory] = useState([]);
const [historyLoading, setHistoryLoading] = useState(false);
const [historyError, setHistoryError] = useState("");
const [dashboardSummary, setDashboardSummary] = useState(null);
const [dashboardLoading, setDashboardLoading] = useState(false);
const [dashboardError, setDashboardError] = useState("");

const fetchDashboardSummary = async () => {
  setDashboardLoading(true);
  setDashboardError("");
  try {
    const response = await axios.get(`${API}/dashboard/summary`);
    setDashboardSummary(response.data);
  } catch (err) {
    setDashboardError(
      err.response?.data?.detail ||
      "Unable to load saved prediction statistics. Check that the backend is running."
    );
  } finally {
    setDashboardLoading(false);
  }
};

useEffect(() => {
  if (activePage === "Overview") fetchDashboardSummary();
}, [activePage]);

// Handle Risk Prediction
const handlePrediction = async () => {
  try {
    setPredictionLoading(true);
    setPredictionError("");
    setPredictionResult(null);

    // Validate numerical fields BEFORE sending to backend
    const invalidFields = numericalFields.filter((field) => {
      const value = predictionData[field.name];

      if (typeof value !== "number" || !Number.isFinite(value)) {
        return true;
      }

      if (
        [
          "Total_Items",
          "Total_Price",
          "Total_Freight",
          "Average_Price",
          "Unique_Products",
          "Unique_Sellers",
          "Product_Weight",
          "Product_Length",
          "Product_Height",
          "Product_Width",
          "Total_Payment",
          "Payment_Installments",
          "Payment_Methods",
        ].includes(field.name) && value < 0
      ) {
        
        return true;
      }

      if (field.name === "Purchase_Month" && (value < 1 || value > 12)) return true;
      if (field.name === "Purchase_Day" && (value < 1 || value > 31)) return true;
      if (field.name === "Purchase_Hour" && (value < 0 || value > 23)) return true;
      if (field.name === "Purchase_Weekday" && (value < 0 || value > 6)) return true;
      if (
  field.name === "Purchase_Year" &&
  (value < 2016 || value > 2018)
) {
  return true;
}
      return false;
    });

    if (invalidFields.length > 0) {
      setPredictionError(
        `Invalid values in: ${invalidFields.map((field) => field.label).join(", ")}`
      );
      return;
    }

    // Validate empty fields
    const emptyFields = Object.entries(predictionData).filter(
      ([key, value]) =>
        value === "" || value === null || value === undefined
    );

    if (emptyFields.length > 0) {
      setPredictionError(
        `Please fill all fields. Missing: ${emptyFields
          .map(([key]) => key)
          .join(", ")}`
      );
      return;
    }

    // All validation passed — send to backend
    const response = await axios.post(
      `${API}/predict-single`,
      predictionData
    );

    setPredictionResult(response.data);

  } catch (error) {
    console.error("Prediction Error:", error);

    let errorMessage = "Unable to generate prediction. Please try again.";

    if (error.response) {
      const detail = error.response.data?.detail;
      if (typeof detail === "string") {
        errorMessage = detail;
      } else if (Array.isArray(detail)) {
        // Pydantic returns an array of validation error objects — convert to readable string
        errorMessage = detail
          .map((e) => `${(e.loc ?? []).slice(1).join(".") || "field"}: ${e.msg}`)
          .join("; ");
      } else {
        errorMessage = `Server Error: ${error.response.status}`;
      }
    } else if (error.request) {
      errorMessage =
        "Backend server is not responding. Please check your connection.";
    }

    setPredictionError(errorMessage);
  } finally {
    setPredictionLoading(false);
  }
};
// Reset Risk Prediction Form
const handleResetPrediction = () => {
  setPredictionData({
    customer_state: "SP",
    Total_Items: 1,
    Total_Price: 86.5,
    Total_Freight: 17.17,
    Average_Price: 79,
    Unique_Products: 1,
    Unique_Sellers: 1,
    Product_Weight: 700,
    Product_Length: 25,
    Product_Height: 13,
    Product_Width: 20,
    Seller_State: "SP",
    Product_Category: "perfumaria",
    Total_Payment: 105.28,
    Payment_Installments: 2,
    Payment_Methods: 1,
    Purchase_Year: 2018,
    Purchase_Month: 6,
    Purchase_Day: 15,
    Purchase_Hour: 15,
    Purchase_Weekday: 3
  });

  setPredictionResult(null);
  setPredictionError("");
};
// Numerical Prediction Fields
const numericalFields = [
  { name: "Total_Items", label: "Total Items" },
  { name: "Total_Price", label: "Total Price" },
  { name: "Total_Freight", label: "Total Freight" },
  { name: "Average_Price", label: "Average Price" },
  { name: "Unique_Products", label: "Unique Products" },
  { name: "Unique_Sellers", label: "Unique Sellers" },
  { name: "Product_Weight", label: "Product Weight" },
  { name: "Product_Length", label: "Product Length" },
  { name: "Product_Height", label: "Product Height" },
  { name: "Product_Width", label: "Product Width" },
  { name: "Total_Payment", label: "Total Payment" },
  { name: "Payment_Installments", label: "Payment Installments" },
  { name: "Payment_Methods", label: "Payment Methods" },
  { name: "Purchase_Year", label: "Purchase Year" },
  { name: "Purchase_Month", label: "Purchase Month" },
  { name: "Purchase_Day", label: "Purchase Day" },
  { name: "Purchase_Hour", label: "Purchase Hour" },
  { name: "Purchase_Weekday", label: "Purchase Weekday" }
];

// Categorical Prediction Options

const customerStates = [
  "AC", "AL", "AM", "AP", "BA", "CE", "DF",
  "ES", "GO", "MA", "MG", "MS", "MT", "PA",
  "PB", "PE", "PI", "PR", "RJ", "RN", "RO",
  "RR", "RS", "SC", "SE", "SP", "TO"
];

const sellerStates = [
  "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MG", "MS", "MT", "PA", "PB", "PE", "PI",
  "PR", "RJ", "RN", "RO", "RS", "SC", "SE", "SP"
];

const productCategories = [
  "agro_industria_e_comercio",
  "alimentos",
  "alimentos_bebidas",
  "artes",
  "artes_e_artesanato",
  "artigos_de_festas",
  "artigos_de_natal",
  "audio",
  "automotivo",
  "bebes",
  "bebidas",
  "beleza_saude",
  "brinquedos",
  "cama_mesa_banho",
  "casa_conforto",
  "casa_conforto_2",
  "casa_construcao",
  "cds_dvds_musicais",
  "cine_foto",
  "climatizacao",
  "consoles_games",
  "construcao_ferramentas_construcao",
  "construcao_ferramentas_ferramentas",
  "construcao_ferramentas_iluminacao",
  "construcao_ferramentas_jardim",
  "construcao_ferramentas_seguranca",
  "cool_stuff",
  "dvds_blu_ray",
  "eletrodomesticos",
  "eletrodomesticos_2",
  "eletronicos",
  "eletroportateis",
  "esporte_lazer",
  "fashion_bolsas_e_acessorios",
  "fashion_calcados",
  "fashion_esporte",
  "fashion_roupa_feminina",
  "fashion_roupa_infanto_juvenil",
  "fashion_roupa_masculina",
  "fashion_underwear_e_moda_praia",
  "ferramentas_jardim",
  "flores",
  "fraldas_higiene",
  "industria_comercio_e_negocios",
  "informatica_acessorios",
  "instrumentos_musicais",
  "la_cuisine",
  "livros_importados",
  "livros_interesse_geral",
  "livros_tecnicos",
  "malas_acessorios",
  "market_place",
  "moveis_colchao_e_estofado",
  "moveis_cozinha_area_de_servico_jantar_e_jardim",
  "moveis_decoracao",
  "moveis_escritorio",
  "moveis_quarto",
  "moveis_sala",
  "musica",
  "papelaria",
  "pc_gamer",
  "pcs",
  "perfumaria",
  "pet_shop",
  "portateis_casa_forno_e_cafe",
  "portateis_cozinha_e_preparadores_de_alimentos",
  "relogios_presentes",
  "seguros_e_servicos",
  "sinalizacao_e_seguranca",
  "tablets_impressao_imagem",
  "telefonia",
  "telefonia_fixa",
  "utilidades_domesticas"
];

const categoricalFields = [
  {
    name: "customer_state",
    label: "Customer State",
    options: customerStates
  },
  {
    name: "Seller_State",
    label: "Seller State",
    options: sellerStates
  },
  {
    name: "Product_Category",
    label: "Product Category",
    options: productCategories
  }
];


  // Model Comparison Data
const modelComparisonData = [
  {
    metric: "Accuracy",
    "Logistic Regression": 64.25,
    "Random Forest": 80.92,
    "XGBoost": 76.41,
  },
  {
    metric: "Precision",
    "Logistic Regression": 12.27,
    "Random Forest": 21.66,
    "XGBoost": 19.96,
  },
  {
    metric: "Recall",
    "Logistic Regression": 55.40,
    "Random Forest": 51.69,
    "XGBoost": 63.39,
  },
  {
    metric: "F1-Score",
    "Logistic Regression": 20.09,
    "Random Forest": 30.53,
    "XGBoost": 30.36,
  },
  {
    metric: "ROC-AUC",
    "Logistic Regression": 65.08,
    "Random Forest": 74.55,
    "XGBoost": 77.19,
  },
];

  const clearMessages = () => {
    setMessage("");
    setError("");
  };

  // Fetch dataset preview and profile
  const loadDatasetDetails = async (id) => {
    const [previewResponse, profileResponse] = await Promise.all([
      axios.get(`${API}/data/preview/${id}`),
      axios.get(`${API}/data/profile/${id}`),
    ]);

    setPreview(previewResponse.data);
    setProfile(profileResponse.data);
  };

  // CSV Upload
  const handleUpload = async () => {
    if (!file) {
      setError("Please select a CSV file first.");
      return;
    }

    clearMessages();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        `${API}/data/upload`,
        formData
      );

      const id = response.data.file_id;

      setFileId(id);
      setFileName(response.data.filename);

      await loadDatasetDetails(id);

      setMessage("Dataset uploaded successfully!");
    } catch (err) {
      setError(err.response?.data?.detail || "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  // Refresh dataset details
  const handleRefresh = async () => {
    if (!fileId) return;

    clearMessages();
    setLoading(true);

    try {
      await loadDatasetDetails(fileId);
      setMessage("Dataset information refreshed.");
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to refresh dataset.");
    } finally {
      setLoading(false);
    }
  };

  // Clean dataset
  const handleClean = async () => {
    if (!fileId) return;

    const confirmed = window.confirm(
      "Cleaning will modify the uploaded dataset. Continue?"
    );

    if (!confirmed) return;

    clearMessages();
    setLoading(true);

    try {
      const response = await axios.post(
        `${API}/data/clean/${fileId}`,
        null,
        {
          params: {
            remove_duplicates: true,
            missing_strategy: "fill_mode",
          },
        }
      );

      await loadDatasetDetails(fileId);

      setMessage(
        `Cleaning completed! Remaining missing values: ${response.data.remaining_missing_values}`
      );
    } catch (err) {
      setError(err.response?.data?.detail || "Cleaning failed.");
    } finally {
      setLoading(false);
    }
  };

  // Preprocess dataset
  const handlePreprocess = async () => {
    if (!fileId) return;

    const confirmed = window.confirm(
      "Preprocessing will modify the uploaded dataset. Continue?"
    );

    if (!confirmed) return;

    clearMessages();
    setLoading(true);

    try {
      const response = await axios.post(
        `${API}/data/preprocess/${fileId}`
      );

      await loadDatasetDetails(fileId);

      setMessage(
        `Preprocessing completed! Total features: ${response.data.total_features}`
      );
    } catch (err) {
      setError(err.response?.data?.detail || "Preprocessing failed.");
    } finally {
      setLoading(false);
    }
  };

  // Download processed CSV
  const handleDownload = async () => {
    if (!fileId) return;

    clearMessages();
    setLoading(true);

    try {
      const response = await axios.get(
        `${API}/data/download/${fileId}`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "text/csv" })
      );

      const link = document.createElement("a");
      link.href = url;
      link.download = "cargo_karma_processed.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      setMessage("CSV downloaded successfully!");
    } catch (err) {
      setError("Download failed.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Feature Importance from FastAPI
useEffect(() => {
  if (activePage !== "Analytics") return;

  const fetchFeatureImportance = async () => {
    setAnalyticsLoading(true);
    setAnalyticsError("");

    try {
      const response = await axios.get(
        `${API}/model/feature-importance`
      );

      setFeatureImportance(response.data.features || []);
    } catch (err) {
      setAnalyticsError(
        err.response?.data?.detail ||
        "Unable to load feature importance data."
      );
    } finally {
      setAnalyticsLoading(false);
    }
  };

  fetchFeatureImportance();
}, [activePage]);

// Fetch SHAP Importance from FastAPI
useEffect(() => {
  if (activePage !== "Explainable AI") return;

  const fetchShapImportance = async () => {
    setShapLoading(true);
    setShapError("");

    try {
      const response = await axios.get(
        `${API}/model/shap-importance`
      );

      setShapImportance(response.data.features || []);
    } catch (err) {
      setShapError(
        err.response?.data?.detail ||
        "Unable to load SHAP importance data."
      );
    } finally {
      setShapLoading(false);
    }
  };

  fetchShapImportance();
}, [activePage]);

// Fetch saved prediction history when its page is opened
const fetchPredictionHistory = async () => {
  setHistoryLoading(true);
  setHistoryError("");

  try {
    const response = await axios.get(`${API}/prediction-history`);
    setPredictionHistory(response.data.history || []);
  } catch (err) {
    setHistoryError(
      err.response?.data?.detail ||
      "Unable to load prediction history. Check that the backend is running."
    );
  } finally {
    setHistoryLoading(false);
  }
};

useEffect(() => {
  if (activePage === "Prediction History" || activePage === "Reports") {
    fetchPredictionHistory();
  }
}, [activePage]);

// Export the currently loaded prediction history as a CSV report.
const downloadPredictionReport = () => {
  const headers = ["ID", "Prediction Time", "Customer State", "Product Category", "Late Delivery Probability (%)", "Risk Level", "Model"];
  const rows = predictionHistory.map((record) => [
    record.id,
    record.prediction_time,
    record.customer_state,
    record.product_category,
    record.late_delivery_probability,
    record.risk_level,
    record.model_name,
  ]);
  const escapeCsv = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "cargo-karma-prediction-report.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

  const stats = [
    {
      title: "Total Predictions",
      value: dashboardSummary ? dashboardSummary.total_predictions.toLocaleString() : "—",
      change: "Saved single-order predictions",
      icon: Truck,
    },
    {
      title: "High Risk Predictions",
      value: dashboardSummary ? dashboardSummary.high_risk_predictions.toLocaleString() : "—",
      change: "Classified as high risk",
      icon: Package,
    },
    {
      title: "Low Risk Predictions",
      value: dashboardSummary ? dashboardSummary.low_risk_predictions.toLocaleString() : "—",
      change: "Classified as low risk",
      icon: TrendingUp,
    },
    {
      title: "Average Late Probability",
      value: dashboardSummary ? `${dashboardSummary.average_late_probability.toFixed(2)}%` : "—",
      change: "Average model-estimated probability",
      icon: Activity,
    },
  ];

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <BrainCircuit size={25} />
          </div>
          <div>
            <h2>Cargo <span>Karma</span></h2>
            <p>INTELLIGENCE PLATFORM</p>
          </div>
        </div>

        <div className="nav-label">MAIN MENU</div>

        <nav>
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                className={`nav-item ${
                  activePage === item.name ? "active" : ""
                }`}
                onClick={() => setActivePage(item.name)}
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <button
            className={`nav-item ${activePage === "Settings" ? "active" : ""}`}
            onClick={() => { setActivePage("Settings"); setSettingsMessage(""); }}
          >
            <Settings size={19} />
            <span>Settings</span>
          </button>

          <div className="system-status">
            <span className="status-dot"></span>
            System Operational
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="breadcrumb">
              Workspace / {activePage}
            </p>
            <h1>{activePage}</h1>
          </div>

          <div className="topbar-actions">
            <button className="icon-button">
              <Search size={19} />
            </button>

            <button className="icon-button notification">
              <Bell size={19} />
            </button>

            <div className="profile">
              <div className="avatar">CK</div>
              <div>
                <strong>Cargo Karma</strong>
                <p>Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* OVERVIEW */}
        {activePage === "Overview" && (
          <>
            <section className="welcome-section">
              <div>
                <p className="eyebrow">
                  AI-POWERED SUPPLY CHAIN INTELLIGENCE
                </p>
                <h2>Welcome to Cargo Karma</h2>
                <p>
                  Monitor delivery risks, explore predictions and make
                  smarter decisions.
                </p>
              </div>

              <div className="welcome-icon">
                <BrainCircuit size={55} />
              </div>
            </section>

            <section className="stats-grid">
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div className="stat-card" key={stat.title}>
                    <div className="stat-top">
                      <span>{stat.title}</span>
                      <div className="stat-icon">
                        <Icon size={20} />
                      </div>
                    </div>

                    <h2>{stat.value}</h2>
                    <p>{stat.change}</p>
                  </div>
                );
              })}
            </section>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", margin: "-8px 0 20px", flexWrap: "wrap" }}>
              <small style={{ opacity: 0.72 }}>Statistics are calculated from saved Cargo Karma predictions, not shipment totals.</small>
              <button className="secondary-button" onClick={fetchDashboardSummary} disabled={dashboardLoading}>
                <RefreshCw size={16} /> {dashboardLoading ? "Refreshing..." : "Refresh Overview"}
              </button>
            </div>
            {dashboardError && <div className="panel error-message" style={{ marginBottom: "18px" }}>{dashboardError}</div>}
            {dashboardLoading && !dashboardSummary && <p className="analytics-message">Loading dashboard statistics...</p>}

            <section className="content-grid">
              <div className="panel overview-panel">
                <div className="panel-heading">
                  <div>
                    <h3>Platform Overview</h3>
                    <p>Supply chain risk intelligence</p>
                  </div>
                  <Activity size={21} />
                </div>

                <div className="overview-content">
                  <div className="overview-circle">
                    <BrainCircuit size={48} />
                  </div>

                  <h2>Predict. Analyze. Optimize.</h2>

                  <p>
                    An explainable AI prototype that estimates e-commerce delivery-delay risk using the Brazilian Olist dataset.
                  </p>
                  <p style={{ fontSize: "12px", opacity: 0.72, marginTop: "10px" }}>
                    Not validated for Indian freight, ports, or bulk-cargo operations.
                  </p>

                  <button
                    className="primary-button"
                    onClick={() => setActivePage("Risk Prediction")}
                  >
                    Start Risk Prediction <ArrowUpRight size={17} />
                  </button>
                </div>
              </div>

              <div className="panel activity-panel">
                <div className="panel-heading">
                  <div>
                    <h3>Model Information</h3>
                    <p>Current prediction engine</p>
                  </div>
                  <ShieldAlert size={21} />
                </div>

                <div className="info-row">
                  <span>Algorithm</span>
                  <strong>XGBoost</strong>
                </div>

                <div className="info-row">
                  <span>Prediction Target</span>
                  <strong>Late Delivery</strong>
                </div>

                <div className="info-row">
                  <span>Model ROC-AUC</span>
                  <strong>0.7719</strong>
                </div>

                <div className="info-row">
                  <span>Explainability</span>
                  <strong className="green-text">
                    SHAP + Feature Importance
                  </strong>
                </div>

                <div className="model-badge">
                  <span className="status-dot"></span>
                  Model Loaded
                </div>
              </div>
            </section>
          </>
        )}

        {/* DATA EXPLORER */}
        {activePage === "Data Explorer" && (
          <section className="data-explorer">

            <div className="panel explorer-upload">
              <div className="panel-heading">
                <div>
                  <h3>Dataset Management</h3>
                  <p>Upload and explore your supply chain datasets</p>
                </div>
                <Database size={24} />
              </div>

              <div className="upload-area">
                <Upload size={38} />

                <h3>Upload CSV Dataset</h3>

                <p>
                  Select a CSV file to begin data analysis and preprocessing.
                  Maximum size: 10 MB.
                </p>

                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    setFile(e.target.files[0] || null);
                    clearMessages();
                  }}
                />

                <button
                  className="primary-button"
                  onClick={handleUpload}
                  disabled={loading}
                >
                  {loading ? "Please wait..." : "Upload Dataset"}
                  <ArrowUpRight size={17} />
                </button>
              </div>
            </div>

            {message && (
              <div className="panel success-message">
                <span>✓</span> {message}
              </div>
            )}

            {error && (
              <div className="panel error-message">
                {error}
              </div>
            )}

            {fileId && (
              <>
                <div className="explorer-toolbar">
                  <div>
                    <h3>{fileName}</h3>
                    <p>Dataset ID: {fileId}</p>
                  </div>

                  <button
                    className="secondary-button"
                    onClick={handleRefresh}
                    disabled={loading}
                  >
                    <RefreshCw size={17} /> Refresh
                  </button>
                </div>

                {/* PROFILE CARDS */}
                {profile && (
                  <div className="stats-grid explorer-stats">
                    <div className="stat-card">
                      <span>Total Rows</span>
                      <h2>{profile.total_rows}</h2>
                    </div>

                    <div className="stat-card">
                      <span>Total Columns</span>
                      <h2>{profile.total_columns}</h2>
                    </div>

                    <div className="stat-card">
                      <span>Missing Values</span>
                      <h2>{profile.missing_values}</h2>
                    </div>

                    <div className="stat-card">
                      <span>Duplicate Rows</span>
                      <h2>{profile.duplicate_rows}</h2>
                    </div>
                  </div>
                )}

                {/* ACTIONS */}
                <div className="panel explorer-actions">
                  <h3>Data Processing Tools</h3>
                  <p>Clean, transform and prepare your dataset.</p>

                  <div className="action-buttons">
                    <button
                      className="secondary-button"
                      onClick={handleClean}
                      disabled={loading}
                    >
                      <Trash2 size={18} />
                      Clean Dataset
                    </button>

                    <button
                      className="secondary-button"
                      onClick={handlePreprocess}
                      disabled={loading}
                    >
                      <Sparkles size={18} />
                      Preprocess Data
                    </button>

                    <button
                      className="primary-button"
                      onClick={handleDownload}
                      disabled={loading}
                    >
                      <Download size={18} />
                      Download CSV
                    </button>
                  </div>
                </div>

                {/* COLUMN PROFILE */}
                {profile && (
                  <div className="panel">
                    <div className="panel-heading">
                      <div>
                        <h3>Column Analysis</h3>
                        <p>Data types and missing value information</p>
                      </div>
                    </div>

                    <div className="table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Column</th>
                            <th>Data Type</th>
                            <th>Missing Values</th>
                            <th>Unique Values</th>
                          </tr>
                        </thead>

                        <tbody>
                          {profile.column_details.map((column) => (
                            <tr key={column.column}>
                              <td>{column.column}</td>
                              <td>{column.data_type}</td>
                              <td>{column.missing}</td>
                              <td>{column.unique_values}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* DATA PREVIEW */}
                {preview && (
                  <div className="panel">
                    <div className="panel-heading">
                      <div>
                        <h3>Dataset Preview</h3>
                        <p>First 10 rows of your dataset</p>
                      </div>
                      <Package size={22} />
                    </div>

                    <div className="table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            {preview.columns.map((column) => (
                              <th key={column}>{column}</th>
                            ))}
                          </tr>
                        </thead>

                        <tbody>
                          {preview.rows.map((row, index) => (
                            <tr key={index}>
                              {preview.columns.map((column) => (
                                <td key={column}>
                                  {row[column] === null
                                    ? "NULL"
                                    : String(row[column])}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {/* ANALYTICS DASHBOARD */}
{activePage === "Analytics" && (
  <section className="analytics-section">

    {/* MODEL PERFORMANCE */}
    <div className="analytics-heading">
      <h2>Model Performance</h2>
      <p>Evaluation results of the XGBoost prediction model.</p>
    </div>

    <div className="stats-grid analytics-stats">

      <div className="stat-card">
        <span>Accuracy</span>
        <h2>76.41%</h2>
        <p>Overall predictions</p>
      </div>

      <div className="stat-card">
        <span>Precision</span>
        <h2>19.96%</h2>
        <p>Correct high-risk alerts</p>
      </div>

      <div className="stat-card">
        <span>Recall</span>
        <h2>63.39%</h2>
        <p>Late orders detected</p>
      </div>

      <div className="stat-card">
        <span>F1-Score</span>
        <h2>30.36%</h2>
        <p>Precision-recall balance</p>
      </div>

    </div>

    {/* FEATURE IMPORTANCE CHART */}
    <div className="panel feature-chart-panel">

      <div className="panel-heading">
        <div>
          <h3>Feature Importance Analysis</h3>
          <p>
            Top 15 features influencing model predictions
          </p>
        </div>

        <ChartNoAxesCombined size={23} />
      </div>

      {analyticsLoading && (
        <p className="analytics-message">
          Loading feature importance...
        </p>
      )}

      {analyticsError && (
        <p className="error-message">
          {analyticsError}
        </p>
      )}

      {!analyticsLoading &&
        !analyticsError &&
        featureImportance.length > 0 && (

          <div className="feature-chart">

            <ResponsiveContainer width="100%" height={520}>
              <BarChart
                data={[...featureImportance].reverse()}
                layout="vertical"
                margin={{
                  top: 10,
                  right: 35,
                  left: 15,
                  bottom: 10,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#29374d"
                  horizontal={false}
                />

                <XAxis
                  type="number"
                  stroke="#94a3b8"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                />

                <YAxis
                  type="category"
                  dataKey="Feature"
                  width={190}
                  stroke="#94a3b8"
                  tick={{ fill: "#cbd5e1", fontSize: 11 }}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111c2e",
                    border: "1px solid #34445d",
                    borderRadius: "8px",
                    color: "#ffffff",
                  }}
                  formatter={(value) => [
                    Number(value).toFixed(5),
                    "Importance",
                  ]}
                />

                <Bar
                  dataKey="Importance"
                  fill="#55c7f3"
                  radius={[0, 5, 5, 0]}
                  barSize={19}
                />

              </BarChart>
            </ResponsiveContainer>

          </div>
        )}

      {!analyticsLoading &&
        !analyticsError &&
        featureImportance.length === 0 && (
          <p className="analytics-message">
            No feature importance data available.
          </p>
        )}

    </div>

    {/* MODEL COMPARISON */}
<div className="panel model-comparison-panel">

  <div className="panel-heading">
    <div>
      <h3>Model Performance Comparison</h3>
      <p>
        Compare Logistic Regression, Random Forest and XGBoost
      </p>
    </div>

    <TrendingUp size={23} />
  </div>

  <div className="comparison-chart">

    <ResponsiveContainer width="100%" height={380}>
      <BarChart
        data={modelComparisonData}
        margin={{
          top: 20,
          right: 25,
          left: 10,
          bottom: 10,
        }}
      >

        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#29374d"
          vertical={false}
        />

        <XAxis
          dataKey="metric"
          stroke="#94a3b8"
          tick={{ fill: "#cbd5e1", fontSize: 12 }}
        />

        <YAxis
          domain={[0, 100]}
          stroke="#94a3b8"
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          tickFormatter={(value) => `${value}%`}
        />

        <Tooltip
          formatter={(value) => `${value}%`}
          contentStyle={{
            backgroundColor: "#111c2e",
            border: "1px solid #34445d",
            borderRadius: "8px",
            color: "#ffffff",
          }}
        />

        <Legend />

        <Bar
          dataKey="Logistic Regression"
          fill="#8b9bb4"
          radius={[5, 5, 0, 0]}
        />

        <Bar
          dataKey="Random Forest"
          fill="#a78bfa"
          radius={[5, 5, 0, 0]}
        />

        <Bar
          dataKey="XGBoost"
          fill="#55c7f3"
          radius={[5, 5, 0, 0]}
        />

      </BarChart>
    </ResponsiveContainer>

  </div>

  <div className="comparison-note">
    <strong>Key Observation:</strong>
    {" "}XGBoost achieves the highest Recall (63.39%) and
    ROC-AUC (77.19%), while Random Forest has the highest
    Accuracy (80.92%) and F1-Score (30.53%).
  </div>

</div>

    {/* MODEL INFORMATION */}
    <div className="panel analytics-info">

      <div className="panel-heading">
        <div>
          <h3>Model Information</h3>
          <p>Current machine learning model</p>
        </div>

        <BrainCircuit size={23} />
      </div>

      <div className="info-row">
        <span>Algorithm</span>
        <strong>XGBoost</strong>
      </div>

      <div className="info-row">
        <span>Dataset</span>
        <strong>Olist E-commerce</strong>
      </div>

      <div className="info-row">
        <span>Total Records</span>
        <strong>96,470</strong>
      </div>

      <div className="info-row">
        <span>Prediction Target</span>
        <strong>Late Delivery</strong>
      </div>

      <div className="info-row">
        <span>ROC-AUC</span>
        <strong>77.19%</strong>
      </div>

    </div>

  </section>
)}
{/* EXPLAINABLE AI DASHBOARD */}
{activePage === "Explainable AI" && (
  <section className="analytics-section">

    <div className="analytics-heading">
      <h2>Explainable AI Analysis</h2>
      <p>
        Understand how different features influence
        XGBoost model predictions using SHAP.
      </p>
    </div>

    {/* SHAP INFORMATION */}
    <div className="stats-grid analytics-stats">

      <div className="stat-card">
        <span>Explainability Method</span>
        <h2>SHAP</h2>
        <p>Shapley-based explanations</p>
      </div>

      <div className="stat-card">
        <span>Model</span>
        <h2>XGBoost</h2>
        <p>Late Delivery Prediction</p>
      </div>

      <div className="stat-card">
        <span>Analysis Samples</span>
        <h2>300</h2>
        <p>Test dataset samples</p>
      </div>

      <div className="stat-card">
        <span>Features Analyzed</span>
        <h2>{shapImportance.length}</h2>
        <p>Transformed model features</p>
      </div>

    </div>

    {/* SHAP FEATURE IMPORTANCE */}
    <div className="panel feature-chart-panel">

      <div className="panel-heading">
        <div>
          <h3>SHAP Feature Importance</h3>
          <p>
            Top 15 features ranked by mean absolute SHAP value
          </p>
        </div>

        <ShieldAlert size={23} />
      </div>

      {shapLoading && (
        <p className="analytics-message">
          Loading SHAP analysis...
        </p>
      )}

      {shapError && (
        <p className="error-message">
          {shapError}
        </p>
      )}

      {!shapLoading &&
        !shapError &&
        shapImportance.length > 0 && (

        <div className="feature-chart">

          <ResponsiveContainer width="100%" height={520}>
            <BarChart
              data={[...shapImportance].reverse()}
              layout="vertical"
              margin={{
                top: 10,
                right: 35,
                left: 15,
                bottom: 10,
              }}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#29374d"
                horizontal={false}
              />

              <XAxis
                type="number"
                stroke="#94a3b8"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
              />

              <YAxis
                type="category"
                dataKey="Feature"
                width={220}
                stroke="#94a3b8"
                tick={{ fill: "#cbd5e1", fontSize: 10 }}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#111c2e",
                  border: "1px solid #34445d",
                  borderRadius: "8px",
                  color: "#ffffff",
                }}
                formatter={(value) => [
                  Number(value).toFixed(6),
                  "Mean |SHAP Value|",
                ]}
              />

              <Bar
                dataKey="SHAP_Importance"
                fill="#55c7f3"
                radius={[0, 5, 5, 0]}
                barSize={19}
              />

            </BarChart>
          </ResponsiveContainer>

        </div>
      )}

      {!shapLoading &&
        !shapError &&
        shapImportance.length === 0 && (
          <p className="analytics-message">
            No SHAP importance data available.
          </p>
      )}

    </div>

    {/* SHAP EXPLANATION */}
    <div className="panel analytics-info">

      <div className="panel-heading">
        <div>
          <h3>Understanding SHAP Values</h3>
          <p>How to interpret this analysis</p>
        </div>

        <BrainCircuit size={23} />
      </div>

      <div className="info-row">
        <span>Method</span>
        <strong>SHAP TreeExplainer</strong>
      </div>

      <div className="info-row">
        <span>Calculation</span>
        <strong>Mean Absolute SHAP</strong>
      </div>

      <div className="info-row">
        <span>Model</span>
        <strong>XGBoost Classifier</strong>
      </div>

      <div className="comparison-note">
        Higher SHAP importance indicates that a feature has
        a greater average influence on model predictions.
        This global importance does not show whether a feature
        increases or decreases an individual prediction.
      </div>

    </div>

  </section>
)}

{/* RISK PREDICTION MODULE */}

{activePage === "Risk Prediction" && (
  <section className="panel">

    <div className="section-header">
      <h2>AI Risk Prediction</h2>
      <p>
        Enter order details to predict late delivery risk.
      </p>
    </div>

    <div className="panel" style={{ marginBottom: "20px" }}>
      <h3>Dataset Information</h3>
      <p>
        Demonstration powered by the Brazilian Olist
        e-commerce dataset. This model is not validated
        for Indian logistics or port operations.
      </p>
    </div>

    <h3>Location & Product Information</h3>

    <div className="prediction-grid"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "18px",
        marginTop: "20px"
      }}
    >

      {categoricalFields.map((field) => (
        <div key={field.name}>
          <label>{field.label}</label>

          <select
            value={predictionData[field.name]}
            onChange={(e) =>
              setPredictionData({
                ...predictionData,
                [field.name]: e.target.value
              })
            }
            style={{ width: "100%" }}
          >
            {field.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      ))}

    </div>

    <h3 style={{ marginTop: "30px" }}>
      Order & Payment Information
    </h3>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "18px",
        marginTop: "20px"
      }}
    >

      {numericalFields.map((field) => (
        <div key={field.name}>
          <label>{field.label}</label>

          <input
            type="number"
            step="any"
            value={predictionData[field.name]}
            onChange={(e) =>
              setPredictionData({
                ...predictionData,
                [field.name]: e.target.value === ""
                  ? ""
                  : Number(e.target.value)
              })
            }
            style={{ width: "100%" }}
          />
        </div>
      ))}

    </div>
<div
  style={{
    display: "flex",
    justifyContent: "center",
    gap: "15px",
    marginTop: "30px",
    flexWrap: "wrap"
  }}
>
  {/* Predict Button */}
  <button
    className="primary-button"
    onClick={handlePrediction}
    disabled={predictionLoading}
  >
    {predictionLoading ? "Analyzing Order..." : "Predict Delivery Risk"}
  </button>

  {/* Reset Button */}
  <button
    onClick={handleResetPrediction}
    disabled={predictionLoading}
    style={{
      padding: "12px 24px",
      borderRadius: "8px",
      border: "1px solid #38bdf8",
      background: "transparent",
      color: "#38bdf8",
      cursor: "pointer",
      fontWeight: "600"
    }}
  >
    Reset Form
  </button>
</div>

    {predictionError && (
      <div style={{ marginTop: "20px" }}>
        <p>{predictionError}</p>
      </div>
    )}

   {/* PREDICTION RESULT */}
{predictionResult && (
  <div className="panel" style={{ marginTop: "25px" }}>

    <div className="section-header">
      <h3>AI Prediction Result</h3>
      <span style={{ color: "#22c55e" }}>
        ● Prediction Successful
      </span>
    </div>

    {/* Risk Classification */}
    <div style={{ marginTop: "25px" }}>
      <h2
        style={{
          color:
            predictionResult.prediction === 1
              ? "#ef4444"
              : "#22c55e"
        }}
      >
        {predictionResult.risk_level}
      </h2>

      <p>Delivery Risk Classification</p>
    </div>

    {/* Risk Score */}
    <div style={{ marginTop: "25px" }}>

      <h1 style={{ fontSize: "42px" }}>
        {predictionResult.late_delivery_probability}%
      </h1>

      <p>Model-estimated Late Delivery Probability</p>

      <div
        style={{
          width: "100%",
          height: "12px",
          background: "#263449",
          borderRadius: "10px",
          overflow: "hidden",
          marginTop: "15px"
        }}
      >
        <div
          style={{
            width: `${Math.min(
              100,
              Math.max(0, predictionResult.late_delivery_probability)
            )}%`,
            height: "100%",
            background:
              predictionResult.prediction === 1
                ? "#ef4444"
                : "#22c55e",
            borderRadius: "10px",
            transition: "width 0.5s ease"
          }}
        />
      </div>

    </div>

    {/* Risk Interpretation */}
    <div style={{ marginTop: "25px" }}>
      <h3>Risk Interpretation</h3>

      <p>
        {predictionResult.prediction === 1
          ? "The model has classified this order as high risk for late delivery."
          : "The model has classified this order as low risk for late delivery."}
      </p>

      <p>{predictionResult.message}</p>
    </div>

    {/* Model Information */}
    <div style={{ marginTop: "25px" }}>
      <h3>Model Information</h3>
      <p>AI Model: {predictionResult.model}</p>
      <p>Prediction Status: Completed</p>
      <p>Classification Threshold: 50%</p>
    </div>

    {/* Disclaimer */}
    <div style={{ marginTop: "20px" }}>
      <p style={{ fontSize: "12px", opacity: 0.7 }}>
        Note: This is a model estimate based on the
        Brazilian Olist e-commerce dataset. It is not
        validated for Indian freight or port logistics.
      </p>
    </div>

  </div>
)}

  </section>
)}

        {/* PREDICTION HISTORY */}
        {activePage === "Prediction History" && (
          <section className="panel">
            <div className="panel-heading">
              <div>
                <h3>Prediction History</h3>
                <p>Latest saved single-order predictions (up to 100 records).</p>
              </div>
              <button
                className="secondary-button"
                onClick={fetchPredictionHistory}
                disabled={historyLoading}
              >
                <RefreshCw size={16} />
                {historyLoading ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            <div className="stats-grid" style={{ marginBottom: "20px" }}>
              <div className="stat-card">
                <span>Saved Predictions</span>
                <h2>{predictionHistory.length}</h2>
              </div>
              <div className="stat-card">
                <span>High Risk</span>
                <h2>
                  {predictionHistory.filter((item) => item.risk_level === "High Risk").length}
                </h2>
              </div>
              <div className="stat-card">
                <span>Low Risk</span>
                <h2>
                  {predictionHistory.filter((item) => item.risk_level === "Low Risk").length}
                </h2>
              </div>
            </div>

            {historyLoading && <p className="analytics-message">Loading prediction history...</p>}
            {historyError && <div className="panel error-message">{historyError}</div>}

            {!historyLoading && !historyError && predictionHistory.length === 0 && (
              <div className="comparison-note">
                No prediction records yet. Generate a prediction in Risk Prediction to create your first history record.
              </div>
            )}

            {!historyLoading && predictionHistory.length > 0 && (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Date & Time</th>
                      <th>Customer State</th>
                      <th>Product Category</th>
                      <th>Late Probability</th>
                      <th>Risk Level</th>
                      <th>Model</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictionHistory.map((record) => (
                      <tr key={record.id}>
                        <td>{record.id}</td>
                        <td>{record.prediction_time}</td>
                        <td>{record.customer_state}</td>
                        <td>{record.product_category}</td>
                        <td>{Number(record.late_delivery_probability).toFixed(2)}%</td>
                        <td>
                          <span style={{
                            color: record.risk_level === "High Risk" ? "#ef4444" : "#22c55e",
                            fontWeight: 700
                          }}>
                            {record.risk_level}
                          </span>
                        </td>
                        <td>{record.model_name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* REPORTS MODULE */}
        {activePage === "Reports" && (
          <section>
            <div className="panel">
              <div className="panel-heading">
                <div>
                  <h3>Prediction Reports</h3>
                  <p>Summary generated from the latest saved prediction records.</p>
                </div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button className="secondary-button" onClick={fetchPredictionHistory} disabled={historyLoading}>
                    <RefreshCw size={16} /> {historyLoading ? "Refreshing..." : "Refresh Data"}
                  </button>
                  <button className="primary-button" onClick={downloadPredictionReport} disabled={predictionHistory.length === 0}>
                    <Download size={16} /> Download CSV
                  </button>
                </div>
              </div>

              {historyLoading && <p className="analytics-message">Preparing report data...</p>}
              {historyError && <div className="panel error-message">{historyError}</div>}

              {!historyLoading && !historyError && (
                <>
                  <div className="stats-grid" style={{ marginTop: "20px" }}>
                    <div className="stat-card"><span>Total Saved Predictions</span><h2>{predictionHistory.length}</h2></div>
                    <div className="stat-card"><span>High Risk Predictions</span><h2>{predictionHistory.filter((x) => x.risk_level === "High Risk").length}</h2></div>
                    <div className="stat-card"><span>Low Risk Predictions</span><h2>{predictionHistory.filter((x) => x.risk_level === "Low Risk").length}</h2></div>
                    <div className="stat-card"><span>Average Late Probability</span><h2>{predictionHistory.length ? (predictionHistory.reduce((sum, x) => sum + Number(x.late_delivery_probability || 0), 0) / predictionHistory.length).toFixed(2) + "%" : "—"}</h2></div>
                  </div>

                  <div className="panel" style={{ marginTop: "22px" }}>
                    <h3>Risk Distribution</h3>
                    <p>Count of saved predictions by model risk classification.</p>
                    {predictionHistory.length === 0 ? (
                      <div className="comparison-note">No prediction data available yet. Generate a prediction first.</div>
                    ) : (
                      <div style={{ width: "100%", height: 300, marginTop: "16px" }}>
                        <ResponsiveContainer>
                          <BarChart data={[
                            { risk: "High Risk", count: predictionHistory.filter((x) => x.risk_level === "High Risk").length },
                            { risk: "Low Risk", count: predictionHistory.filter((x) => x.risk_level === "Low Risk").length },
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="risk" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" name="Predictions" fill="#22d3ee" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                  <div className="comparison-note" style={{ marginTop: "18px" }}>
                    <strong>Data scope:</strong> This report uses the latest {predictionHistory.length} records returned by the Prediction History API (maximum 100). The model was trained on Brazil's Olist e-commerce dataset; these results are not validated freight or Indian port predictions.
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {/* SETTINGS MODULE */}
        {activePage === "Settings" && (
          <section className="settings-page">
            <div className="settings-intro">
              <div>
                <p className="eyebrow">WORKSPACE CONFIGURATION</p>
                <h2>Settings & System Information</h2>
                <p>Review your project, model and backend connection. Preferences are stored locally in this browser.</p>
              </div>
              <div className="settings-hero-icon"><SlidersHorizontal size={30} /></div>
            </div>

            <div className="settings-grid">
              <article className="panel settings-card">
                <div className="settings-card-heading"><div className="settings-card-icon"><Info size={19} /></div><div><h3>Project Information</h3><p>Application overview</p></div></div>
                <div className="settings-info-list">
                  <div><span>Project name</span><strong>Cargo Karma</strong></div>
                  <div><span>Platform</span><strong>AI-Powered Logistics Intelligence</strong></div>
                  <div><span>Frontend</span><strong>React + Vite</strong></div>
                  <div><span>Backend</span><strong>FastAPI (Python)</strong></div>
                  <div><span>API address</span><strong className="settings-code">{API}</strong></div>
                </div>
              </article>

              <article className="panel settings-card">
                <div className="settings-card-heading"><div className="settings-card-icon"><BrainCircuit size={19} /></div><div><h3>Model Information</h3><p>Current prediction model and data scope</p></div></div>
                <div className="settings-info-list">
                  <div><span>Model</span><strong>XGBoost Classifier</strong></div>
                  <div><span>Prediction task</span><strong>Late delivery risk classification</strong></div>
                  <div><span>Training dataset</span><strong>Brazilian Olist e-commerce</strong></div>
                  <div><span>Training period</span><strong>2016–2018</strong></div>
                  <div><span>Model file</span><strong className="settings-code">supplychainx_xgboost.pkl</strong></div>
                </div>
                <div className="settings-warning"><AlertCircle size={17} /><p>This model has not been validated for Indian freight, vessel chartering or port logistics. Predictions are estimates, not guarantees.</p></div>
              </article>

              <article className="panel settings-card">
                <div className="settings-card-heading"><div className="settings-card-icon"><Wifi size={19} /></div><div><h3>API Connection</h3><p>Check whether the backend is reachable</p></div></div>
                <div className="api-status-row">
                  <span className={`api-status-dot ${apiStatus}`} />
                  <strong>{apiStatus === "online" ? "Backend Connected" : apiStatus === "checking" ? "Checking connection…" : apiStatus === "offline" ? "Backend Unavailable" : "Connection not checked"}</strong>
                </div>
                <p className="settings-muted">Endpoint: <span className="settings-code">{API}/</span></p>
                {apiCheckedAt && <p className="settings-muted">Last checked: {apiCheckedAt}</p>}
                <button className="primary-button settings-action" onClick={checkApiConnection} disabled={apiStatus === "checking"}>
                  <Wifi size={16} /> {apiStatus === "checking" ? "Checking…" : "Test API Connection"}
                </button>
              </article>

              <article className="panel settings-card">
                <div className="settings-card-heading"><div className="settings-card-icon"><SlidersHorizontal size={19} /></div><div><h3>Preferences</h3><p>Local application preferences</p></div></div>
                <div className="preference-row"><div><strong>Show model disclaimer</strong><p>Keep dataset limitations visible in relevant areas.</p></div><label className="settings-switch"><input type="checkbox" checked={preferences.showModelDisclaimer} onChange={(e) => setPreferences({ ...preferences, showModelDisclaimer: e.target.checked })} /><span /></label></div>
                <div className="preference-row"><div><strong>Confirm before reset</strong><p>Keep confirmation enabled for reset actions where supported.</p></div><label className="settings-switch"><input type="checkbox" checked={preferences.confirmBeforeReset} onChange={(e) => setPreferences({ ...preferences, confirmBeforeReset: e.target.checked })} /><span /></label></div>
                <div className="preference-row"><div><strong>Compact data tables</strong><p>Save this display preference for future table styling.</p></div><label className="settings-switch"><input type="checkbox" checked={preferences.compactTables} onChange={(e) => setPreferences({ ...preferences, compactTables: e.target.checked })} /><span /></label></div>
                <div className="settings-button-row">
                  <button className="primary-button settings-action" onClick={savePreferences}><Save size={16} /> Save Preferences</button>
                  <button className="secondary-button settings-action" onClick={resetPreferences}><RotateCcw size={16} /> Restore Defaults</button>
                </div>
                {settingsMessage && <p className="settings-success"><CheckCircle2 size={16} /> {settingsMessage}</p>}
              </article>
            </div>
            <p className="settings-footnote">Settings are stored in this browser only. API address and model configuration are informational and are not editable from this page.</p>
          </section>
        )}

        {/* OTHER MODULES */}
     {!["Overview", "Data Explorer", "Analytics", "Explainable AI", "Risk Prediction", "Prediction History", "Reports", "Settings"].includes(activePage) && (
          <section className="panel placeholder-panel">
            <div className="overview-circle">
              <BrainCircuit size={42} />
            </div>

            <h2>{activePage}</h2>

            <p>
              This module will be connected to the Cargo Karma backend
              in the next development phase.
            </p>

            <button
              className="primary-button"
              onClick={() => setActivePage("Overview")}
            >
              Back to Overview
            </button>
          </section>
        )}

        <footer>
          Cargo Karma © 2026
          <span>
            AI-Powered Supply Chain Risk & Decision Intelligence
          </span>
        </footer>
      </main>
    </div>
  );
}

export default App;