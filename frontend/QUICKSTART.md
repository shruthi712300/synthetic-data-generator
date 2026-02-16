# QUICKSTART - Synthetic Data Generator V2

## ⚡ 5-Minute Setup

```bash
# 1. Extract
tar -xzf synthetic-data-v2.tar.gz
cd synthetic-data-v2

# 2. Install (1-2 minutes)
npm install

# 3. Start
npm run dev

# 4. Open browser
http://localhost:3000
```

## 🎯 Quick Demo (5 minutes)

### Step 1: Databases (30 sec)
1. Click "Production Insurance DB"
2. Click "Development Insurance DB"
3. Click "Next: Detect Schema"

### Step 2: Schema (30 sec)
1. See 8 tables detected
2. Click any table → Expand to see schema
3. Note PII badges on some tables
4. Click "Next: Configure Data Generation"

### Step 3: Data Controls (1 min)
1. All tables enabled by default
2. Tables with PII show masking options
3. Try different masking modes:
   - **Masked Copy** (default)
   - Fully Synthetic
   - Hybrid
4. Click "Next: Preview Generated Data"

### Step 4: Data Preview (2 min)
1. **Main Tab**: Click table buttons to view data
   - Try "policyholders" - see masked Tax ID, Email, Phone
   - Try "beneficiaries" - see masked SSN, DOB
   - Try "policies" - see clean policy data
   
2. **PII Detection Tab**: 
   - See all 11 PII fields detected
   - Color legend: Blue=SSN, Green=Email, Yellow=Phone, Purple=DOB
   - Masking summary stats
   
3. **Compliance Tab**:
   - 4 compliance violation types explained
   - Examples for each
   
4. **Relationships Tab**:
   - 4 relationship error types
   - Foreign key violations
   - Integrity scorecard

5. Click "Next: Configure Data Errors"

### Step 5: Error Config (1 min)
1. Expand "Data Quality Issues"
2. Move slider for "Missing Policy Effective Dates" to 5%
3. See: Affected tables, columns, record count
4. Scroll down - see affected table data with errors
5. Try "Business Logic & Statistical"
6. Adjust "Behavior Rules" if needed
7. Click "Next: Preview Destination Data"

### Step 6: Final Preview (30 sec)
1. See summary stats
2. Click different tables to see errors
3. Note "Status" column shows Valid/Error
4. Error cells highlighted in red
5. Click "Save to Destination Database"
6. Done!

---

## 🎨 What Makes V2 Different

### Before (V1):
- All steps on one long page
- Lots of scrolling
- Hard to find things
- Sliders barely visible

### After (V2):
- Each step = one page
- No scrolling needed
- Easy navigation
- Big, visible sliders

---

## 📊 Key Features to Try

### 1. Table Selector Buttons
- Click any table name
- Data appears below instantly
- No scrolling

### 2. Sub-section Tabs
- In Step 4: Click tabs to switch views
- Data | PII | Compliance | Relationships

### 3. Enhanced Sliders
- Big, visible thumb
- Clear percentage display
- Smooth animation
- Easy to use

### 4. Affected Records
- Each error shows:
  - Tables affected
  - Columns affected
  - How many records

### 5. Real-time Preview
- Step 5: Change slider
- See data update below
- No need to go back

---

## 🚀 Try These Scenarios

### Scenario A: Perfect Data
- Step 3: All tables, Masked Copy
- Step 5: All sliders at 0%
- Result: Clean data with PII masked

### Scenario B: Light Testing
- Step 3: Select 3-4 tables
- Step 5: Set errors to 1-2%
- Result: Realistic test data

### Scenario C: Stress Test
- Step 3: All tables, Fully Synthetic
- Step 5: Set errors to 5-10%
- Result: High-error dataset

---

## 📁 What's Included

- ✅ 8 corporate insurance tables
- ✅ 195 sample records
- ✅ 11 PII fields (auto-masked)
- ✅ 28 error types
- ✅ 3 PII masking modes
- ✅ 6-step workflow
- ✅ Light purple theme

---

## 🔧 Quick Tips

1. **Navigation**: Use Previous/Next buttons
2. **Step Indicator**: Purple circle = current step
3. **Table Selection**: Buttons highlight when selected
4. **Sliders**: Drag the big purple circle
5. **Sub-sections**: Use tabs in Step 4
6. **Preview**: Data updates automatically

---

## ❓ Common Questions

**Q: Can I skip steps?**
A: No, use Previous/Next to navigate

**Q: Where's the data?**
A: Click table buttons to see data below

**Q: How do I introduce errors?**
A: Step 5, use the sliders

**Q: How do I see PII info?**
A: Step 4, click "PII Detection & Masking" tab

**Q: Where's the save button?**
A: Step 6, at the bottom

---

## 🎯 Success Checklist

After your first run, you should have:
- [  ] Completed all 6 steps
- [  ] Seen data for multiple tables
- [  ] Introduced some errors (any %)
- [  ] Viewed PII masking
- [  ] Read compliance info
- [  ] Understood relationships
- [  ] Saved to destination

---

## 📞 Next Steps

1. Read full README.md for details
2. Explore each sub-section
3. Try different error combinations
4. Experiment with PII modes
5. Check the code to customize

---

**Enjoy the new streamlined workflow!** 🎉

Port: 3000 | 6 Steps | Separated Pages | Enhanced UX
