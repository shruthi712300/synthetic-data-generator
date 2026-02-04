# Synthetic Data Generator V2 - Corporate Insurance
## Enhanced UI Flow with Separated Steps and PII Masking

Complete redesign with 6-step workflow, each step on its own page with comprehensive features.

## 🎯 What's New in V2

### Major Changes:
1. **Separated Step Pages**: Each of the 6 steps now has its own dedicated page
2. **Enhanced Step Indicator**: Top progress bar highlights current step
3. **Port Changed**: Now runs on **port 3000** (was 5173)
4. **Table-Level Controls**: Enable/disable generation per table
5. **PII Masking Modes**: Choose Masked Copy, Fully Synthetic, or Hybrid per table
6. **Comprehensive Sub-sections**: PII Detection, Compliance, and Relationships explained
7. **Improved Error Sliders**: More visible with better UX
8. **Affected Records Display**: See exactly which tables/columns/records are affected
9. **Real-time Preview**: View data changes without scrolling

## 📋 Complete 6-Step Workflow

### Step 1: Source & Destination Database Selection
- Select source database (Production)
- Select destination database (Dev/QA)
- Auto-detect schema after selection

### Step 2: Detected Schema & Relationships
- View all 8 detected tables
- Expand any table to see complete schema
- View Primary Keys, Foreign Keys, and constraints
- See PII field indicators
- **NO data preview** - schema only

### Step 3: Data Generation Controls
**Table-Level Controls:**
- Enable/disable each table individually
- Toggle switches for quick control

**PII Masking Strategies (per table):**
- **Masked Copy**: Prod structure + masked PII values (fastest)
- **Fully Synthetic**: Entire dataset statistically generated (highest privacy)
- **Hybrid**: Safe fields + synthesized sensitive columns

### Step 4: Generated Data Preview
**Main Data View:**
- Select table from highlighted buttons
- View generated data below (no scrolling needed)
- PII fields color-coded and masked

**4 Sub-sections (Tabs):**
1. **Generated Data** (default): View table data
2. **PII Detection & Masking**: 
   - See all PII fields detected
   - Masking strategies applied
   - Color legend (SSN-Blue, Email-Green, Phone-Yellow, DOB-Purple)
   
3. **Compliance**:
   - Agent License Validation
   - Regional Certification Requirements
   - Policy Type Regulatory Compliance
   - Underwriting Approval Requirements
   
4. **Relationships**:
   - Orphaned Claims / Claims Without Valid Policy ID
   - Payments Without Claims
   - Policy Without Valid Client
   - Policy Without Valid Agent
   - Relationship integrity scorecard

### Step 5: Configure Data Errors
**Logically Grouped Error Categories:**

**Group 1: Data Quality Issues**
- Data Completeness (5 errors)
- Data Consistency (3 errors)
- Data Accuracy (3 errors)
- Format Issues (3 errors)

**Group 2: Business Logic & Statistical**
- Business Logic Violations (3 errors)
- Statistical Errors (4 prebuilt presets)

**Group 3: Referential Integrity & Relationships**
- Referential Integrity (2 errors)
- Relationship Violations (3 errors)

**Group 4: Behavior Rules Validation**
- Claim Rate (10-30% target with actual from source)
- Premium Distribution (Skewed vs Uniform)
- Seasonal Renewals (Q1, Q4 peaks)
- Option to adjust if out of range

**Enhanced Features:**
- Visible sliders with percentage display
- Shows affected tables and columns
- Shows number of affected records
- Real-time data preview below
- Errors respect DB constraints
- Constraint violations flagged separately

### Step 6: Destination Data Preview
- Shows final data with errors
- Same structure as Step 4 but with error indicators
- Each table shows error count
- Status column (Valid / Error)
- Error cells highlighted
- Comments on error types
- **Save to Destination** button at bottom

## 🚀 Quick Start

```bash
# Extract files
tar -xzf synthetic-data-v2.tar.gz
cd synthetic-data-v2

# Install dependencies
npm install

# Start on port 3000
npm run dev

# Open browser
http://localhost:3000
```

## 📊 Tables & Data

### 8 Corporate Insurance Tables:
1. **policies** (15 columns, 25 records)
2. **claims** (12 columns, 30 records)
3. **policyholders** (18 columns, 20 records) - 3 PII fields
4. **beneficiaries** (14 columns, 25 records) - 4 PII fields
5. **payments** (11 columns, 30 records) - 1 PII field
6. **training_certification** (8 columns, 25 records)
7. **region_regulatory_rules** (6 columns, 20 records)
8. **agent_employee_brokers** (12 columns, 20 records) - 3 PII fields

**Total:** 195 records, 94 columns, 11 PII fields

## 🔒 PII Masking

### Color-Coded System:
- 🔵 **SSN / Tax ID**: XXX-XX-6789
- 🟢 **Email**: j.smith@synthmail.com
- 🟡 **Phone**: (555) 789-0123
- 🟣 **DOB**: Age-preserved synthetic dates
- 🔴 **Bank Account**: ****1234

### Masking Modes:
- **Masked Copy**: Keep structure, mask PII (fastest adoption)
- **Fully Synthetic**: Generate entire dataset (highest privacy)
- **Hybrid**: Mix real safe data with synthetic sensitive data

## ⚠️ Error Types (28 Total)

### Data Quality (14 errors):
- Missing fields, inconsistent data, accuracy issues, format problems

### Business Logic (7 errors):
- Overlapping periods, temporal violations, statistical anomalies

### Referential Integrity (5 errors):
- Orphaned records, broken relationships, invalid foreign keys

### Behavior Rules (2 adjustable):
- Claim rates, premium distribution, seasonal patterns

## 🎨 Design Features

- **Light purple theme** matching existing app
- **Step indicator** always visible at top
- **Current step highlighted** with purple circle
- **Clean navigation** with Previous/Next buttons
- **Responsive design** for all screen sizes
- **Professional card-based** layout
- **Color-coded badges** for status indicators

## 📁 Project Structure

```
synthetic-data-v2/
├── src/
│   ├── App.jsx                          # Main app with routing
│   ├── App.css                          # Updated styles
│   ├── components/
│   │   ├── SyntheticDataDashboard.jsx   # Main dashboard + Steps 1-2
│   │   ├── StepComponents.jsx           # Steps 3-4 + subsections
│   │   └── Step5and6.jsx                # Steps 5-6
│   └── utils/
│       └── dataGenerator.js             # Data generation logic
├── package.json                         # Updated for port 3000
└── vite.config.js
```

## 🔧 Key Features

### 1. Separated Steps
Each step is a complete page with its own functionality. No scrolling between sections needed.

### 2. Table Selector Buttons
Click any table name to instantly see its data below. Highlighted buttons show active selection.

### 3. Enhanced Sliders
Sliders are now more visible with:
- Clear track
- Visible thumb
- Percentage display
- Smooth animation

### 4. Affected Records
For each error type, see:
- Which tables affected
- Which columns affected
- How many records affected (count + percentage)

### 5. Constraint Validation
Errors introduced won't:
- Break foreign key constraints
- Violate NOT NULL requirements
- Create duplicate primary keys
- Flagged separately if they would

### 6. Sub-section Tabs
In Step 4, easily switch between:
- Data preview
- PII details
- Compliance info
- Relationship info

## 📖 Usage Guide

### Typical Workflow:

1. **Step 1**: Select Prod DB → Select Dev DB → Next
2. **Step 2**: Review schema → Expand tables if needed → Next
3. **Step 3**: 
   - Toggle tables on/off
   - Choose PII masking mode for tables with PII
   - Next
4. **Step 4**: 
   - Click table buttons to view data
   - Switch tabs to see PII/Compliance/Relationships
   - Next
5. **Step 5**: 
   - Expand error categories
   - Adjust sliders (0-10%)
   - Set behavior rules
   - See affected tables below
   - Next
6. **Step 6**: 
   - Review final data with errors
   - Click Save to Destination Database
   - Done!

## 🎯 Demo Scenarios

### Scenario 1: Clean Test Data
- Step 3: Enable all tables, Masked Copy mode
- Step 5: Leave all errors at 0%
- Result: Perfect data with PII masked

### Scenario 2: Light Testing
- Step 3: Enable key tables only
- Step 5: Set errors to 1-2% each
- Result: Realistic test data with minor issues

### Scenario 3: Stress Testing
- Step 3: Enable all tables, Fully Synthetic
- Step 5: Set errors to 5-10% each
- Result: High-error dataset for validation testing

## 🔍 What to Look For

### In Step 2 (Schema):
- ✓ 8 tables detected
- ✓ All relationships mapped
- ✓ PII fields identified

### In Step 3 (Controls):
- ✓ Toggle switches work
- ✓ PII mode radio buttons
- ✓ PII fields listed per table

### In Step 4 (Preview):
- ✓ Table buttons highlight on click
- ✓ Data appears below without scrolling
- ✓ PII cells color-coded
- ✓ Sub-section tabs switch content
- ✓ Compliance section shows 4 rule types
- ✓ Relationships section shows 4 violation types

### In Step 5 (Errors):
- ✓ 3 error groups (collapsible)
- ✓ Sliders visible and smooth
- ✓ Affected tables/columns shown
- ✓ Record count displayed
- ✓ Behavior rules show actual vs target
- ✓ Adjust toggle for out-of-range values
- ✓ Affected table data preview below

### In Step 6 (Destination):
- ✓ Summary stats at top
- ✓ Table buttons show error count
- ✓ Status column in data
- ✓ Error cells highlighted
- ✓ Save button at bottom

## ⚙️ Configuration

### Change Port:
Edit `package.json`:
```json
"scripts": {
  "dev": "vite --port 3001"
}
```

### Modify Tables:
Edit `src/components/SyntheticDataDashboard.jsx` - `tables` array

### Add Error Types:
Edit `src/components/Step5and6.jsx` - `errorCategories` array

### Customize Colors:
Edit `src/App.css` - `:root` variables

## 🐛 Troubleshooting

**Port 3000 in use?**
```bash
lsof -ti:3000 | xargs kill -9
npm run dev
```

**Components not loading?**
- Check console for import errors
- Verify all files in src/components/
- Run `npm install` again

**Sliders not visible?**
- Check browser zoom level
- Try different browser
- Clear cache

**Data not updating?**
- Click table buttons to refresh
- Check errorConfig state
- View browser console

## 📦 Files Included

- ✅ Complete React application
- ✅ All 6 steps implemented
- ✅ 4 sub-sections in Step 4
- ✅ Enhanced error configuration
- ✅ Data generation utilities
- ✅ Complete styling (light purple theme)
- ✅ README and documentation

## 🎓 Learning Resources

- React Hooks: useState for state management
- Component composition: Separated steps
- Conditional rendering: Sub-sections
- Event handling: Sliders, toggles, buttons
- Data flow: Props and callbacks

## 🚀 Next Steps

After exploring:
1. Customize error types for your domain
2. Add more tables
3. Implement actual DB connections
4. Add export to SQL/CSV
5. Build API integration

---

**Built with React + Vite** | **Port 3000** | **6-Step Workflow** | **PII Masking** | **Corporate Insurance**

Questions? Check the code comments or the inline documentation!
