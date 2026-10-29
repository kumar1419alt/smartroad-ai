# SmartRoad AI — FastAPI Backend Foundation

The backend foundation for **SmartRoad AI**, an AI and GIS-based municipal road damage detection and repair prioritization system. Built with **FastAPI**, **SQLAlchemy**, and **Pydantic v2**.

---

## 1. Quickstart & Installation (Windows)

### Prerequisites
- Python 3.10+ (Tested on Python 3.14.4)
- Git & PowerShell

### Step-by-Step Setup

```powershell
# 1. Navigate to the project root
cd c:\Users\Ankush kumar\.gemini\antigravity-ide\scratch\road-damage-system

# 2. (Optional) Create and activate a Python virtual environment
python -m venv backend/venv
.\backend\venv\Scripts\Activate.ps1

# 3. Install dependencies
pip install -r backend/requirements.txt

# 4. Create the local environment file
Copy-Item backend\.env.example backend\.env
```

---

## 2. Running the Server

You can run the development server from **either** the project root or from inside `backend/`:

**Option A — From project root:**
```powershell
python -m uvicorn backend.main:app --reload --port 8000
```

**Option B — From inside `backend/`:**
```powershell
cd backend
uvicorn main:app --reload --port 8000
```

Once running:
- **Interactive OpenAPI Documentation (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc Documentation**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Health Check Probe**: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

---

## 3. Running Automated Tests

Run the complete test suite with `pytest`:

```powershell
# Run all backend tests with verbose output
python -m pytest backend/tests/ -v
```

> **Note**: Automated tests utilize a temporary, isolated SQLite database (`test_smartroad_pytest.db`) created dynamically per test run, ensuring your development data in `smartroad.db` is never corrupted. All 54 tests run and pass without side effects.

---

## 4. API Endpoints Reference

All endpoints are mounted under `/api/v1`.

| Method | Endpoint | Description | Status Code |
|---|---|---|---|
| `GET` | `/` | API index and docs redirect | `200 OK` |
| `GET` | `/api/v1/health` | Service health and DB connection check | `200 OK` |
| `GET` | `/api/v1/complaints` | List paginated complaints with filtering (status, severity, ward, damageType) | `200 OK` |
| `POST` | `/api/v1/complaints` | Submit road defect complaint (validates coordinates, deduplicates incident IDs) | `201 Created` |
| `GET` | `/api/v1/complaints/{complaint_id}` | Retrieve complaint by municipal ID (`PMC-...`) or incident ID (`INC-...`) | `200 OK` / `404` |
| `GET` | `/api/v1/admin/complaints` | Administrative overview with search and multi-criteria filters | `200 OK` |
| `PUT` | `/api/v1/admin/complaints/{id}/status` | Update complaint status (`Pending` -> `In Progress` -> `Resolved`, etc.) | `200 OK` / `404` |
| `PUT` | `/api/v1/admin/complaints/{id}/assign` | Assign engineer and squad; auto-promotes `Pending` to `In Progress` | `200 OK` / `404` |
| `POST` | `/api/v1/detection/infer` | AI Road Damage Detection inference contract | `200 OK` |

---

## 5. AI Vision & Inference Contract (`/detection/infer`)

The inference endpoint conforms strictly to the schema expected by `src/services/detectionService.js`:

### Request Body (`POST /api/v1/detection/infer`)
```json
{
  "session_id": "session_live_123",
  "timestamp": "2026-10-28T18:00:00Z",
  "image": "data:image/jpeg;base64,...",
  "gps": {
    "latitude": 18.5204,
    "longitude": 73.8567,
    "accuracy": 5.0
  },
  "confidence_threshold": 0.70
}
```

### Response When No Model Is Configured
Because no trained YOLO weights currently exist:
- The endpoint returns `status: "model_not_configured"`.
- It returns an empty detections list: `"detections": []`.
- **Zero fake bounding boxes or synthetic detections are generated.**
- Complaints will not be automatically generated from unverified frames.

```json
{
  "success": false,
  "status": "model_not_configured",
  "model": "YOLOv8-RDD2022 (Unconfigured)",
  "message": "YOLO model weights are not configured. Mount or train custom RDD2022 weights via YOLO_MODEL_PATH to enable live inference.",
  "inference_time_ms": 0,
  "detections": []
}
```

### Enabling Trained YOLO Weights
When custom RDD2022 weights (`.pt` or ONNX) are trained in subsequent phases:
1. Place weights file in `backend/weights/yolov8_rdd2022.pt`.
2. Set `YOLO_MODEL_PATH=backend/weights/yolov8_rdd2022.pt` in `backend/.env`.
3. Restart the FastAPI service; `InferenceEngine` will initialize the active model.

---

## 6. Frontend Integration & Demo Compatibility

- **Frontend Compatibility**: `ComplaintResponse` exposes camelCase aliases (`damageType`, `incidentId`, `coordinates: [lat, lng]`, `priorityScore`, `assignedSquad`) mirroring the React state model.
- **Demo Mode Isolation**: The frontend's demo simulation and localStorage mock services remain intact, allowing offline demonstration without a running backend.
- **CORS Support**: Pre-configured for Vite dev server origins (`http://localhost:5173`, `http://127.0.0.1:5173`, and `http://localhost:3000`).

---

## 7. Security & Limitations Note

> **Development Mode Notice**: The current administrative endpoints (`/admin/*`) use a lightweight development authentication helper (`verify_admin_access`). This is intended for local multi-role development and **does not** constitute production-grade RBAC or JWT authentication. In a future phase, OAuth2/JWT tokens with role claims must be implemented before exposing to public networks.

