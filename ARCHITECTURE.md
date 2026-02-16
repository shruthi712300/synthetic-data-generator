# System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                               │
│                    (React Frontend - Port 3000)                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐      │
│  │   Upload     │      │  Configure   │      │  Download    │      │
│  │   Schema     │─────▶│   Records    │─────▶│   Results    │      │
│  │   & Samples  │      │   Counts     │      │              │      │
│  └──────────────┘      └──────────────┘      └──────────────┘      │
│         │                      │                      ▲              │
│         │                      │                      │              │
│         └──────────────────────┼──────────────────────┘              │
│                                │                                     │
└────────────────────────────────┼─────────────────────────────────────┘
                                 │
                                 │ HTTP POST /api/generate
                                 │ { schema, sampleData, recordCounts }
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        BACKEND API                                   │
│                   (Flask Server - Port 5000)                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│                    SyntheticDataGenerator                             │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  1. ANALYZE PATTERNS                                        │     │
│  │     • Parse schema structure                                │     │
│  │     • Analyze sample data distributions                     │     │
│  │     • Calculate statistics (mean, std, min, max)            │     │
│  │     • Identify categorical values                           │     │
│  │     • Detect column name patterns                           │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                 │                                     │
│                                 ▼                                     │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  2. GENERATE DATA                                           │     │
│  │     • Sort tables by dependencies                           │     │
│  │     • Generate primary keys                                 │     │
│  │     • Create foreign key references                         │     │
│  │     • Apply learned patterns                                │     │
│  │     • Use Faker for realistic data                          │     │
│  │     • Maintain data type consistency                        │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                 │                                     │
│                                 ▼                                     │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  3. VALIDATE & RETURN                                       │     │
│  │     • Verify foreign key integrity                          │     │
│  │     • Check constraints                                     │     │
│  │     • Format as JSON                                        │     │
│  │     • Return to frontend                                    │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘


                            DATA FLOW
                            
┌──────────────┐
│   Schema     │──┐
│   (JSON)     │  │
└──────────────┘  │
                  │
┌──────────────┐  │    ┌─────────────────┐
│   Sample     │  ├───▶│   Pattern       │
│   Data       │  │    │   Analysis      │
│   (JSON)     │  │    │   Engine        │
└──────────────┘  │    └─────────────────┘
                  │             │
┌──────────────┐  │             │
│   Record     │──┘             │
│   Counts     │                │
└──────────────┘                ▼
                       ┌─────────────────┐
                       │   Generation    │
                       │   Algorithm     │
                       └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Synthetic     │
                       │   Dataset       │
                       │   (JSON)        │
                       └─────────────────┘


                      TABLE DEPENDENCIES
                      
         customers (PK: customer_id)
              │
              ├───────────────┐
              │               │
              ▼               ▼
         orders          reviews
    (FK: customer_id)  (FK: customer_id, product_id)
              │               ▲
              │               │
              ▼               │
        order_items           │
    (FK: order_id)            │
              │               │
              └───────────────┘
                      │
                      ▼
              products (PK: product_id)


                  GENERATION ALGORITHM
                  
1. Table Ordering:
   ┌─────────────┐
   │  customers  │ ─── No dependencies, generate first
   │  products   │
   └─────────────┘
          │
          ▼
   ┌─────────────┐
   │  orders     │ ─── Depends on customers
   │  reviews    │ ─── Depends on customers & products
   └─────────────┘
          │
          ▼
   ┌─────────────┐
   │ order_items │ ─── Depends on orders & products
   └─────────────┘

2. For Each Table:
   
   For each row (n records):
      
      For each column:
         
         IF primary_key:
            ┌────────────────┐
            │ Auto-increment │
            └────────────────┘
         
         ELSE IF foreign_key:
            ┌────────────────────┐
            │ Pick random from   │
            │ referenced table   │
            └────────────────────┘
         
         ELSE IF has_pattern:
            ┌────────────────────┐
            │ Generate using     │
            │ learned pattern    │
            └────────────────────┘
         
         ELSE:
            ┌────────────────────┐
            │ Generate based on  │
            │ data type & name   │
            └────────────────────┘


                    PATTERN LEARNING
                    
Sample: ["john@email.com", "jane@email.com", "bob@email.com"]
         │
         ▼
    ┌─────────────────────────────────┐
    │ Pattern Detection               │
    │ • All contain "@"              │
    │ • Format: name@domain.ext      │
    │ • Average length: 16 chars     │
    └─────────────────────────────────┘
         │
         ▼
    ┌─────────────────────────────────┐
    │ Generation Rule                 │
    │ Use Faker.email()              │
    │ → "alice@email.com"            │
    └─────────────────────────────────┘


Sample: [25, 30, 35, 28, 32]
         │
         ▼
    ┌─────────────────────────────────┐
    │ Statistical Analysis            │
    │ • Mean: 30                     │
    │ • Std Dev: 3.74                │
    │ • Min: 25, Max: 35            │
    └─────────────────────────────────┘
         │
         ▼
    ┌─────────────────────────────────┐
    │ Generation Rule                 │
    │ random.normalvariate(30, 3.74) │
    │ → 28, 32, 29, 31, ...          │
    └─────────────────────────────────┘


                  TECHNOLOGY STACK
                  
┌─────────────────────────────────────────────────┐
│              FRONTEND (React)                    │
├─────────────────────────────────────────────────┤
│ • React 18.2 - UI Library                       │
│ • Vite 5.0 - Build Tool                         │
│ • Lucide Icons - Icon Library                   │
│ • Fetch API - HTTP Requests                     │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│              BACKEND (Python)                    │
├─────────────────────────────────────────────────┤
│ • Flask 3.0 - Web Framework                     │
│ • Flask-CORS - CORS Support                     │
│ • Faker 22.0 - Fake Data Generation             │
│ • NumPy 1.26 - Statistical Operations           │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│              DATA FORMATS                        │
├─────────────────────────────────────────────────┤
│ • JSON - All data exchange                      │
│ • Schema Definition - Table structure           │
│ • Sample Data - Training examples               │
│ • Generated Data - Output results               │
└─────────────────────────────────────────────────┘


                   DEPLOYMENT FLOW
                   
Development:
   ┌──────────┐
   │  Edit    │──▶ Frontend: npm run dev (hot reload)
   │  Code    │──▶ Backend: python app.py (debug mode)
   └──────────┘

Production:
   ┌──────────┐
   │  Build   │──▶ Frontend: npm run build
   └──────────┘──▶ Backend: Gunicorn/WSGI server
        │
        ▼
   ┌──────────┐
   │  Deploy  │──▶ Serve static files
   └──────────┘──▶ Run Flask on production server
        │
        ▼
   ┌──────────┐
   │  Access  │──▶ http://your-domain.com
   └──────────┘


Key Design Principles:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Separation of Concerns (Frontend ↔ Backend)
✓ RESTful API Design
✓ Pattern-Based Intelligence
✓ Foreign Key Integrity
✓ Extensible Architecture
✓ User-Friendly Interface
✓ Local Processing (Privacy)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
