# Synthetic Data Generator - Complete Guide

## 🎯 What You've Received

A complete, production-ready synthetic data generation application with:

### ✨ Features
- **Beautiful React Frontend** with modern, animated UI
- **Intelligent Python Backend** with pattern-learning algorithms
- **5-Table E-commerce Dataset** ready for testing
- **Smart Data Generation** that learns from your samples
- **Foreign Key Support** maintains referential integrity
- **Export Capabilities** download as JSON files

### 📦 Package Contents

```
synthetic-data-generator/
├── backend/              # Flask API server
├── frontend/             # React application
├── sample_data/          # Test data (5 tables)
├── README.md            # Full documentation
├── PROJECT_STRUCTURE.md # Architecture details
├── start.sh            # Quick start (Unix/Mac)
└── start.bat           # Quick start (Windows)
```

## 🚀 Quick Start (3 Steps)

### Option 1: Automated (Recommended)

**Mac/Linux:**
```bash
chmod +x start.sh
./start.sh
```

**Windows:**
```batch
start.bat
```

### Option 2: Manual Setup

**Step 1: Backend**
```bash
cd backend
pip install -r requirements.txt
python app.py
```

**Step 2: Frontend (new terminal)**
```bash
cd frontend
npm install
npm run dev
```

**Step 3: Open Browser**
Navigate to `http://localhost:3000`

## 📋 Testing the Application

### Using Included Sample Data

1. **Upload Schema**
   - Click "Schema Definition" upload area
   - Select `sample_data/schema.json`
   - ✅ Confirms "5 tables loaded"

2. **Upload Samples**
   - Click "Sample Data" upload area
   - Select ALL files from `sample_data/` ending in `_sample.json`:
     - customers_sample.json
     - products_sample.json
     - orders_sample.json
     - order_items_sample.json
     - reviews_sample.json
   - ✅ Confirms "5 tables with samples"

3. **Configure Generation**
   - Each table shows with default 100 records
   - Adjust numbers (1-10,000) as needed
   - Example: 500 customers, 200 products, 1000 orders

4. **Generate**
   - Click "Generate Synthetic Data"
   - Wait for processing (a few seconds)
   - Download buttons appear for each table

5. **Download Results**
   - Click "Download JSON" for each table
   - Files saved as `tablename_generated.json`

## 🎨 UI Features

### Modern Design
- **Dark gradient theme** with purple/blue accents
- **Smooth animations** on all interactions
- **Status badges** for upload confirmation
- **Loading indicators** during generation
- **Hover effects** on all interactive elements

### User Experience
- Drag-and-drop file upload
- Real-time validation
- Clear error messages
- Progress feedback
- One-click downloads

## 🧠 How It Works

### Pattern Learning
The system analyzes your sample data to understand:
- **Statistical distributions** (mean, std, min, max)
- **Value patterns** (email formats, phone formats)
- **Categorical sets** (status values, categories)
- **String lengths** and common formats
- **Null occurrence rates**

### Smart Generation
Based on learned patterns, it generates:
- **Realistic emails** following your format
- **Phone numbers** matching your style
- **Names** using Faker library
- **Addresses** with proper structure
- **Dates** within reasonable ranges
- **Numbers** matching distributions
- **Foreign keys** maintaining relationships

### Example Intelligence

**Input Sample:**
```json
{
  "email": "john.smith@company.com",
  "status": "active",
  "age": 35
}
```

**System Learns:**
- Email format: firstname.lastname@domain.com
- Status: categorical (active, inactive, pending)
- Age: numeric, around 35 ± some variance

**Generates:**
```json
{
  "email": "sarah.johnson@company.com",
  "status": "active",
  "age": 32
}
```

## 📊 Sample Database Schema

### E-commerce System (5 Tables)

**1. customers** (no dependencies)
- Primary table for customer information
- Fields: name, email, phone, registration date, status

**2. products** (no dependencies)
- Product catalog
- Fields: name, category, price, stock, description, active status

**3. orders** (depends on customers)
- Customer orders
- Foreign key: customer_id → customers.customer_id
- Fields: order date, total amount, status, shipping address

**4. order_items** (depends on orders, products)
- Line items for orders
- Foreign keys: order_id, product_id
- Fields: quantity, unit price, discount

**5. reviews** (depends on customers, products)
- Product reviews
- Foreign keys: customer_id, product_id
- Fields: rating, review text, review date

### Relationships Diagram
```
customers ──┬─→ orders ──→ order_items
            └─→ reviews
                    ↑
products ──────┬────┘
               └─→ order_items
```

## 🔧 Customization Guide

### Adding New Data Types

Edit `backend/app.py`, find `generate_value()` method:

```python
elif col_type == 'your_new_type':
    if 'special_keyword' in col_name.lower():
        return your_custom_logic()
    return default_value()
```

### Changing UI Colors

Edit `frontend/src/App.jsx`, modify gradient:

```javascript
background: 'linear-gradient(135deg, #your-color1 0%, #your-color2 100%)'
```

### Adjusting Ports

**Backend** (`backend/app.py`):
```python
app.run(debug=True, host='0.0.0.0', port=5001)  # Change 5000 to 5001
```

**Frontend** (`frontend/vite.config.js`):
```javascript
server: {
  port: 3001,  // Change 3000 to 3001
  ...
}
```

### Custom Column Recognition

Add patterns in `backend/app.py`, `generate_value()`:

```python
col_lower = col_name.lower()
if 'your_keyword' in col_lower:
    return your_generation_logic()
```

## 🐛 Troubleshooting

### "Module not found" Error

**Backend:**
```bash
cd backend
pip install -r requirements.txt
```

**Frontend:**
```bash
cd frontend
npm install
```

### Port Already in Use

**Check what's using the port:**
```bash
# Mac/Linux
lsof -i :5000
lsof -i :3000

# Windows
netstat -ano | findstr :5000
netstat -ano | findstr :3000
```

**Kill the process or change port** (see Customization section)

### CORS Errors

Ensure:
1. Backend is running on port 5000
2. Flask-CORS is installed: `pip install flask-cors`
3. Both servers are running

### Generation Takes Too Long

- Reduce record counts (try 100-500 instead of 10,000)
- Ensure sample data is properly formatted
- Check terminal for error messages

### Upload Fails

- Verify JSON syntax (use jsonlint.com)
- Check file naming: `tablename_sample.json`
- Ensure schema matches sample data structure

## 📈 Performance Tips

### Optimal Settings
- **Sample size**: 10-50 records per table
- **Generation**: 100-1,000 records for testing
- **Production**: Up to 10,000 records per table

### Best Practices
1. Start with small datasets (100 records)
2. Verify output quality
3. Scale up gradually
4. Provide diverse sample data
5. Include edge cases in samples

## 🔒 Data Privacy

- No data leaves your machine
- All processing is local
- No external API calls
- Generated data is completely synthetic
- Safe for testing and development

## 📚 Advanced Usage

### Creating Custom Schema

```json
{
  "tables": {
    "users": {
      "columns": [
        {
          "name": "user_id",
          "type": "INTEGER",
          "primary_key": true,
          "nullable": false
        },
        {
          "name": "username",
          "type": "VARCHAR",
          "nullable": false
        },
        {
          "name": "created_at",
          "type": "DATETIME",
          "nullable": false
        }
      ]
    }
  }
}
```

### Sample Data Format

```json
[
  {
    "user_id": 1,
    "username": "john_doe",
    "created_at": "2024-01-15T10:30:00"
  },
  {
    "user_id": 2,
    "username": "jane_smith",
    "created_at": "2024-01-16T14:20:00"
  }
]
```

### Foreign Key Setup

```json
{
  "name": "user_id",
  "type": "INTEGER",
  "nullable": false,
  "foreign_key": {
    "references": {
      "table": "users",
      "column": "user_id"
    }
  }
}
```

## 🎓 Learning Resources

### Understanding the Code

1. **Backend**: Read `backend/app.py`
   - `SyntheticDataGenerator` class
   - `analyze_column_patterns()` - pattern detection
   - `generate_value()` - data generation
   - `generate_table_data()` - batch generation

2. **Frontend**: Read `frontend/src/App.jsx`
   - React hooks (useState)
   - File upload handling
   - API calls with fetch
   - Component structure

### Extending Functionality

**Add CSV Export:**
```python
import csv
# In backend, add CSV conversion
# In frontend, add CSV download button
```

**Add Database Connection:**
```python
import sqlalchemy
# Connect to actual database
# Generate and insert directly
```

## 🌟 Use Cases

### Testing
- Generate test data for QA
- Create realistic datasets
- Test foreign key constraints
- Validate application logic

### Development
- Populate development databases
- Create demo environments
- Test performance at scale
- Develop without production data

### Training
- Machine learning datasets
- Algorithm testing
- Data science practice
- SQL query practice

### Demos
- Product demonstrations
- Sales presentations
- Training sessions
- Documentation examples

## 📞 Support

### Common Issues
- ✅ Check README.md troubleshooting section
- ✅ Verify all dependencies installed
- ✅ Ensure ports are available
- ✅ Check browser console for errors
- ✅ Review terminal output

### File Locations
- Main docs: `README.md`
- Architecture: `PROJECT_STRUCTURE.md`
- Backend code: `backend/app.py`
- Frontend code: `frontend/src/App.jsx`
- Test data: `sample_data/`

## 🎉 You're Ready!

1. Start the application (use quick start scripts)
2. Upload the sample data files
3. Generate synthetic data
4. Download and use in your projects

Happy data generating! 🚀

---

**Built with:** React, Flask, Faker, NumPy
**License:** MIT
**Version:** 1.0.0
