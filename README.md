# Synthetic Data Generator

A powerful web application for generating realistic synthetic data based on your database schema and sample records. The application intelligently analyzes your data patterns and relationships to create high-quality synthetic datasets.

## Features

- 🎯 **Schema-Based Generation**: Upload your database schema with table definitions, primary keys, foreign keys, and data types
- 📊 **Pattern Learning**: Analyzes sample data to understand patterns, distributions, and relationships
- 🔗 **Relationship Preservation**: Maintains foreign key relationships and referential integrity
- 🎨 **Beautiful UI**: Modern, intuitive interface built with React
- ⚡ **Fast Processing**: Efficient Python backend with intelligent data generation algorithms
- 📁 **Multiple Tables**: Support for complex multi-table schemas
- 💾 **Easy Export**: Download generated data as JSON files

## Architecture

### Frontend
- **React** with modern hooks
- **Lucide Icons** for beautiful iconography
- **Vite** for fast development and building
- Responsive design with custom styling

### Backend
- **Flask** RESTful API
- **Faker** library for realistic data generation
- **NumPy** for statistical analysis
- Pattern recognition and data analysis algorithms

## Prerequisites

- Node.js 16+ and npm
- Python 3.8+
- pip (Python package manager)

## Installation

### 1. Clone or download the project

### 2. Setup Backend

```bash
cd backend
pip install -r requirements.txt
```

### 3. Setup Frontend

```bash
cd frontend
npm install
```

## Running the Application

### 1. Start the Backend Server

```bash
cd backend
python app.py
```

The backend will start on `http://localhost:5000`

### 2. Start the Frontend Development Server

In a new terminal:

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:3000`

### 3. Open your browser

Navigate to `http://localhost:3000`

## Usage Guide

### Step 1: Upload Schema

1. Click on the "Schema Definition" upload area
2. Select your `schema.json` file
3. The system will parse and display the number of tables

**Schema Format:**
```json
{
  "tables": {
    "table_name": {
      "columns": [
        {
          "name": "column_name",
          "type": "INTEGER|VARCHAR|DECIMAL|DATE|DATETIME|BOOLEAN|TEXT",
          "primary_key": true/false,
          "nullable": true/false,
          "foreign_key": {
            "references": {
              "table": "referenced_table",
              "column": "referenced_column"
            }
          }
        }
      ]
    }
  }
}
```

### Step 2: Upload Sample Data

1. Click on the "Sample Data" upload area
2. Select multiple JSON files (one per table)
3. Name files as `tablename_sample.json` (e.g., `customers_sample.json`)

**Sample Data Format:**
```json
[
  {
    "column1": "value1",
    "column2": "value2",
    ...
  },
  ...
]
```

### Step 3: Configure Generation

1. Set the number of records you want to generate for each table
2. The system will show all detected tables with input fields
3. Default is 100 records per table (adjustable from 1 to 10,000)

### Step 4: Generate Data

1. Click the "Generate Synthetic Data" button
2. Wait for processing (shown with loading indicator)
3. Generated data will appear in the results section

### Step 5: Download Results

1. Each table will have a "Download JSON" button
2. Click to download the generated data for that table
3. Files are named as `tablename_generated.json`

## Test Data Included

The `sample_data/` directory contains a complete e-commerce database example:

### Tables:
1. **customers** (10 sample records)
   - customer_id, first_name, last_name, email, phone, date_of_birth, registration_date, status

2. **products** (12 sample records)
   - product_id, product_name, category, price, stock_quantity, description, is_active

3. **orders** (10 sample records)
   - order_id, customer_id (FK), order_date, total_amount, order_status, shipping_address

4. **order_items** (15 sample records)
   - order_item_id, order_id (FK), product_id (FK), quantity, unit_price, discount_percentage

5. **reviews** (12 sample records)
   - review_id, product_id (FK), customer_id (FK), rating, review_text, review_date

### Relationships:
- customers → orders (one-to-many)
- products → order_items (one-to-many)
- orders → order_items (one-to-many)
- customers → reviews (one-to-many)
- products → reviews (one-to-many)

## How It Works

### Data Generation Algorithm

1. **Schema Analysis**
   - Parses table definitions
   - Identifies primary keys, foreign keys, and data types
   - Determines table generation order based on dependencies

2. **Pattern Learning**
   - Analyzes sample data distributions
   - Calculates statistical properties (mean, std, min, max)
   - Identifies unique value sets for categorical data
   - Detects column name patterns (email, phone, name, etc.)

3. **Smart Generation**
   - Respects data types and constraints
   - Maintains referential integrity for foreign keys
   - Uses Faker library for realistic data
   - Applies learned patterns from samples
   - Handles nullable columns appropriately

4. **Quality Assurance**
   - Ensures unique primary keys
   - Validates foreign key relationships
   - Maintains data type consistency
   - Respects null constraints

## Data Type Support

- **Numeric**: INTEGER, BIGINT, SMALLINT, FLOAT, DOUBLE, DECIMAL, NUMERIC
- **String**: VARCHAR, CHAR, TEXT, STRING
- **Date/Time**: DATE, DATETIME, TIMESTAMP
- **Boolean**: BOOLEAN, BOOL

## Column Name Recognition

The generator intelligently recognizes column names and generates appropriate data:

- `*email*` → email addresses
- `*phone*`, `*mobile*` → phone numbers
- `*address*` → full addresses
- `*city*` → city names
- `*state*` → state names
- `*country*` → country names
- `*zip*`, `*postal*` → postal codes
- `*name*` → person names (with first/last detection)
- `*company*`, `*organization*` → company names
- `*url*`, `*website*` → URLs
- `*description*`, `*comment*` → text paragraphs
- `*status*` → status values (active, inactive, pending, completed)

## Troubleshooting

### Backend Issues

**Error: Module not found**
```bash
pip install -r requirements.txt
```

**Port 5000 already in use**
```bash
# Edit app.py and change the port
app.run(debug=True, host='0.0.0.0', port=5001)
```

### Frontend Issues

**Error: Cannot find module**
```bash
npm install
```

**Port 3000 already in use**
```bash
# Edit vite.config.js and change the port
server: {
  port: 3001,
  ...
}
```

### CORS Issues

If you encounter CORS errors:
1. Ensure Flask-CORS is installed: `pip install flask-cors`
2. Verify the backend is running on port 5000
3. Check the proxy configuration in `vite.config.js`

## Customization

### Adding Custom Data Types

Edit `backend/app.py` and add your logic to the `generate_value()` method:

```python
elif col_type == 'your_custom_type':
    return your_generation_logic()
```

### Styling Changes

The frontend uses inline styles with CSS variables. Modify colors in the component:

```javascript
style={{
  background: 'your-color',
  ...
}}
```

### Adjusting Generation Logic

Modify pattern analysis in the `analyze_column_patterns()` method to add custom detection logic.

## Performance Tips

- For large datasets (>10,000 records), generation may take time
- Sample data quality directly impacts output quality
- Provide at least 10-20 sample records per table for best results
- Foreign key tables should be generated before dependent tables

## License

MIT License - Feel free to use and modify for your needs.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Verify your schema and sample data format
3. Ensure all dependencies are installed
4. Check browser console for frontend errors
5. Check terminal for backend errors

## Future Enhancements

- CSV export option
- SQL insert statement generation
- Database direct connection
- Data validation rules
- Custom data generators
- Batch processing for very large datasets
- Data quality metrics
- Schema auto-detection from existing databases

---

Built with ❤️ using React, Flask, and modern web technologies.
