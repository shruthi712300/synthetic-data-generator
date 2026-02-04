# Project Structure

```
synthetic-data-generator/
│
├── README.md                          # Main documentation
├── start.sh                           # Quick start script (Unix/Linux/Mac)
├── start.bat                          # Quick start script (Windows)
│
├── backend/                           # Python Flask backend
│   ├── app.py                        # Main Flask application
│   └── requirements.txt              # Python dependencies
│
├── frontend/                          # React frontend
│   ├── src/
│   │   ├── App.jsx                  # Main React component
│   │   └── main.jsx                 # Entry point
│   ├── index.html                    # HTML template
│   ├── package.json                  # Node.js dependencies
│   └── vite.config.js               # Vite configuration
│
└── sample_data/                       # Test data files
    ├── schema.json                   # Database schema definition
    ├── customers_sample.json         # Sample customer data
    ├── products_sample.json          # Sample product data
    ├── orders_sample.json            # Sample order data
    ├── order_items_sample.json       # Sample order items data
    └── reviews_sample.json           # Sample review data
```

## File Descriptions

### Backend Files

**app.py**
- Flask REST API server
- SyntheticDataGenerator class with intelligent data generation
- Pattern analysis algorithms
- Foreign key relationship handling
- Data type inference and generation logic

**requirements.txt**
- flask: Web framework
- flask-cors: CORS support for API
- faker: Realistic fake data generation
- numpy: Statistical analysis

### Frontend Files

**App.jsx**
- Main React component
- File upload handling
- UI for configuration
- Results display and download
- Beautiful gradient design with animations

**main.jsx**
- React app initialization
- Root component mounting

**index.html**
- HTML template
- Root div for React

**package.json**
- React and dependencies
- Vite for fast development
- Lucide icons for UI

**vite.config.js**
- Development server configuration
- Proxy setup for API calls
- Port configuration

### Sample Data Files

**schema.json**
Complete e-commerce database schema with 5 tables:
- customers (primary table)
- products (primary table)
- orders (references customers)
- order_items (references orders and products)
- reviews (references products and customers)

**Sample JSON files**
Each contains 10-15 realistic sample records demonstrating:
- Proper data types
- Realistic values
- Foreign key relationships
- Nullable fields
- Various data patterns

## Quick Reference

### Starting the Application

**Unix/Linux/Mac:**
```bash
./start.sh
```

**Windows:**
```batch
start.bat
```

**Manual Start:**

Backend:
```bash
cd backend
pip install -r requirements.txt
python app.py
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

### Testing with Sample Data

1. Upload `sample_data/schema.json`
2. Upload all files matching `*_sample.json` from sample_data/
3. Configure record counts (default 100 each)
4. Click "Generate Synthetic Data"
5. Download generated files

### API Endpoints

**POST /api/generate**
- Accepts: schema, sampleData, recordCounts
- Returns: Generated data for all tables

**GET /api/health**
- Health check endpoint
- Returns: {"status": "healthy"}

### Ports

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### Key Features

✅ Schema-based generation
✅ Pattern learning from samples
✅ Foreign key relationships
✅ Smart data type inference
✅ Column name recognition
✅ Nullable field support
✅ Statistical distribution matching
✅ Beautiful modern UI
✅ Export as JSON

## Customization Points

1. **Backend Generation Logic**: `backend/app.py` → `generate_value()` method
2. **Pattern Analysis**: `backend/app.py` → `analyze_column_patterns()` method
3. **UI Styling**: `frontend/src/App.jsx` → inline styles
4. **Port Configuration**: `frontend/vite.config.js` and `backend/app.py`
5. **Data Types**: `backend/app.py` → Add new types in `generate_value()`

## Dependencies Summary

**Python:**
- Flask 3.0.0 (Web framework)
- Flask-CORS 4.0.0 (CORS support)
- Faker 22.0.0 (Fake data generation)
- NumPy 1.26.3 (Numerical operations)

**Node.js:**
- React 18.2.0 (UI library)
- Vite 5.0.8 (Build tool)
- Lucide-react 0.263.1 (Icons)
