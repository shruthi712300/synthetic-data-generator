from flask import Flask, request, jsonify
from flask_cors import CORS
import random
from datetime import datetime, timedelta
from faker import Faker
import numpy as np
import csv
import io
import traceback
import uuid
import time
import copy

# =====================================================
# FLASK SETUP
# =====================================================
app = Flask(__name__)
CORS(app)
fake = Faker()

# =====================================================
# DATA STORAGE - IN-MEMORY DATABASE
# =====================================================
DATA_STORAGE = {
    "base_data": {},           # Stores original generated data (no errors)
    "modified_data": {},       # Stores data with errors applied
    "sessions": {},            # Session metadata
    "previews": {},            # Destination previews
    "stats": {},               # Usage statistics
    "error_configs": {}        # Store error configurations per data_key
}

# =====================================================
# ERROR INJECTION DEFAULT CONFIG
# =====================================================
DEFAULT_ERROR_CONFIG = {
    "enabled": False,
    "error_percentage": 0.0,
    "error_types": []
}

# =====================================================
# SESSION MANAGEMENT
# =====================================================
class SessionManager:
    @staticmethod
    def create_session():
        """Create a new session for data storage"""
        session_id = str(uuid.uuid4())
        DATA_STORAGE["sessions"][session_id] = {
            "created_at": datetime.now().isoformat(),
            "last_accessed": datetime.now().isoformat(),
            "base_data_keys": [],      # Keys for base (original) data
            "modified_data_keys": [],  # Keys for data with errors
            "preview_keys": [],        # Keys for previews
            "status": "active",
            "expires_at": time.time() + 3600  # 1 hour expiration
        }
        return session_id
    
    @staticmethod
    def get_session(session_id):
        """Get session data and update access time"""
        if session_id in DATA_STORAGE["sessions"]:
            DATA_STORAGE["sessions"][session_id]["last_accessed"] = datetime.now().isoformat()
            return DATA_STORAGE["sessions"][session_id]
        return None
    
    @staticmethod
    def store_base_data(session_id, data_key, data, metadata=None):
        """Store original generated data (without errors)"""
        if session_id not in DATA_STORAGE["sessions"]:
            session_id = SessionManager.create_session()
        
        # Store the base data
        DATA_STORAGE["base_data"][data_key] = {
            "session_id": session_id,
            "data": copy.deepcopy(data),  # Deep copy to prevent modifications
            "metadata": metadata or {},
            "created_at": datetime.now().isoformat(),
            "format": "json",
            "size": len(str(data)),
            "is_base": True
        }
        
        # Update session
        if data_key not in DATA_STORAGE["sessions"][session_id]["base_data_keys"]:
            DATA_STORAGE["sessions"][session_id]["base_data_keys"].append(data_key)
        
        return data_key
    
    @staticmethod
    def store_modified_data(session_id, data_key, base_data_key, data, error_config, error_logs):
        """Store modified data with errors applied"""
        if session_id not in DATA_STORAGE["sessions"]:
            session_id = SessionManager.create_session()
        
        # Store the modified data
        DATA_STORAGE["modified_data"][data_key] = {
            "session_id": session_id,
            "base_data_key": base_data_key,
            "data": copy.deepcopy(data),  # Deep copy
            "error_config": error_config,
            "error_logs": error_logs,
            "created_at": datetime.now().isoformat(),
            "format": "json",
            "size": len(str(data)),
            "is_base": False
        }
        
        # Store error configuration
        DATA_STORAGE["error_configs"][data_key] = error_config
        
        # Update session
        if data_key not in DATA_STORAGE["sessions"][session_id]["modified_data_keys"]:
            DATA_STORAGE["sessions"][session_id]["modified_data_keys"].append(data_key)
        
        return data_key
    
    @staticmethod
    def get_data(data_key, get_base=False):
        """Retrieve stored data by key"""
        if get_base and data_key in DATA_STORAGE["base_data"]:
            return DATA_STORAGE["base_data"][data_key]["data"]
        elif data_key in DATA_STORAGE["modified_data"]:
            return DATA_STORAGE["modified_data"][data_key]["data"]
        elif data_key in DATA_STORAGE["base_data"]:
            return DATA_STORAGE["base_data"][data_key]["data"]
        return None
    
    @staticmethod
    def get_data_info(data_key):
        """Get metadata about stored data"""
        if data_key in DATA_STORAGE["base_data"]:
            return {
                "type": "base",
                "info": DATA_STORAGE["base_data"][data_key]
            }
        elif data_key in DATA_STORAGE["modified_data"]:
            return {
                "type": "modified",
                "info": DATA_STORAGE["modified_data"][data_key]
            }
        return None
    
    @staticmethod
    def get_error_config(data_key):
        """Get error configuration for modified data"""
        return DATA_STORAGE["error_configs"].get(data_key, DEFAULT_ERROR_CONFIG)
    
    @staticmethod
    def get_base_data_for_modified(modified_data_key):
        """Get the base data key for a modified data set"""
        if modified_data_key in DATA_STORAGE["modified_data"]:
            return DATA_STORAGE["modified_data"][modified_data_key]["base_data_key"]
        return None
    
    @staticmethod
    def store_preview(data_key, preview_data, destination_type):
        """Store destination preview data"""
        preview_id = f"preview_{data_key}_{destination_type}"
        DATA_STORAGE["previews"][preview_id] = {
            "data_key": data_key,
            "preview_data": preview_data,
            "destination_type": destination_type,
            "created_at": datetime.now().isoformat()
        }
        return preview_id
    
    @staticmethod
    def get_preview(data_key, destination_type=None):
        """Get preview data"""
        if destination_type:
            preview_id = f"preview_{data_key}_{destination_type}"
            return DATA_STORAGE["previews"].get(preview_id)
        else:
            # Return all previews for this data_key
            return {k: v for k, v in DATA_STORAGE["previews"].items() 
                   if k.startswith(f"preview_{data_key}")}
    
    @staticmethod
    def cleanup_expired_sessions():
        """Clean up expired sessions and their data"""
        current_time = time.time()
        expired_sessions = []
        
        for session_id, session_data in DATA_STORAGE["sessions"].items():
            if session_data["expires_at"] < current_time:
                expired_sessions.append(session_id)
        
        for session_id in expired_sessions:
            # Remove all data associated with this session
            session = DATA_STORAGE["sessions"][session_id]
            
            # Remove base data
            for data_key in session["base_data_keys"]:
                if data_key in DATA_STORAGE["base_data"]:
                    del DATA_STORAGE["base_data"][data_key]
            
            # Remove modified data
            for data_key in session["modified_data_keys"]:
                if data_key in DATA_STORAGE["modified_data"]:
                    del DATA_STORAGE["modified_data"][data_key]
                if data_key in DATA_STORAGE["error_configs"]:
                    del DATA_STORAGE["error_configs"][data_key]
            
            # Remove previews
            all_data_keys = session["base_data_keys"] + session["modified_data_keys"]
            for data_key in all_data_keys:
                previews_to_remove = [k for k in DATA_STORAGE["previews"] 
                                     if k.split('_')[1] == data_key]
                for preview_key in previews_to_remove:
                    del DATA_STORAGE["previews"][preview_key]
            
            # Remove session
            del DATA_STORAGE["sessions"][session_id]

# =====================================================
# ERROR INJECTION HELPERS
# =====================================================
def inject_date_error():
    return random.choice([
        "2024-13-45",
        "99/99/9999",
        "abcd-ef-gh",
        (datetime.now() + timedelta(days=365)).strftime("%Y-%m-%d")
    ])

def inject_string_length_error(max_length):
    return "X" * (max_length + 150)

def apply_error_injection_to_copy(base_data, schema, error_config):
    """Apply error injection to a copy of base data"""
    if not error_config.get("enabled"):
        return copy.deepcopy(base_data), []
    
    error_logs = []
    error_rate = error_config.get("error_percentage", 0)
    error_types = error_config.get("error_types", [])
    
    modified_data = copy.deepcopy(base_data)
    
    for table, rows in modified_data.items():
        table_schema = {
            c["name"]: c for c in schema["tables"][table]["columns"]
        }
        
        total_rows = len(rows)
        error_rows = int(total_rows * error_rate)
        
        if error_rows <= 0:
            continue
        
        row_indexes = random.sample(range(total_rows), error_rows)
        
        for row_idx in row_indexes:
            row = rows[row_idx]
            
            for col_name, col_def in table_schema.items():
                col_type = col_def.get("type", "").lower()
                
                # DATE ERRORS
                if "date" in error_types and col_type in ["date", "datetime", "timestamp"]:
                    bad_value = inject_date_error()
                    row[col_name] = bad_value
                    
                    error_logs.append({
                        "table": table,
                        "generated_row": row_idx,
                        "column": col_name,
                        "error_message": "Invalid date value",
                        "invalid_value": bad_value
                    })
                
                # STRING LENGTH ERRORS
                if "string_length" in error_types and col_type in ["varchar", "char", "text", "string"]:
                    max_len = col_def.get("max_length", 50)
                    bad_value = inject_string_length_error(max_len)
                    row[col_name] = bad_value
                    
                    error_logs.append({
                        "table": table,
                        "generated_row": row_idx,
                        "column": col_name,
                        "error_message": "String length exceeds allowed limit",
                        "invalid_value": bad_value
                    })
    
    return modified_data, error_logs

# =====================================================
# SYNTHETIC DATA GENERATOR
# =====================================================
class SyntheticDataGenerator:
    def __init__(self, schema, sample_data):
        self.schema = schema
        self.sample_data = sample_data
        self.generated_data = {}
        self.pk_counters = {}

    def analyze_column_patterns(self, table, column):
        try:
            values = [
                r.get(column)
                for r in self.sample_data.get(table, [])
                if r.get(column) is not None
            ]
            if not values:
                return None

            patterns = {
                "unique_values": list(set(values)),
                "avg_length": np.mean([len(str(v)) for v in values])
            }

            nums = [v for v in values if isinstance(v, (int, float))]
            if nums:
                patterns["min"] = min(nums)
                patterns["max"] = max(nums)

            return patterns
        except:
            return None

    def generate_value(self, col, patterns=None):
        name = col["name"].lower()
        ctype = col["type"].lower()

        if col.get("nullable") and random.random() < 0.1:
            return None

        if patterns and patterns.get("unique_values") and len(patterns["unique_values"]) < 50:
            return random.choice(patterns["unique_values"])

        if ctype in ["int", "integer", "bigint"]:
            return random.randint(1, 100000)

        if ctype in ["float", "double", "decimal"]:
            return round(random.uniform(1, 10000), 2)

        if ctype in ["varchar", "char", "text", "string"]:
            if "email" in name:
                return fake.email()
            if "name" in name:
                return fake.name()
            if "phone" in name:
                return fake.phone_number()
            return fake.text(max_nb_chars=50)

        if ctype in ["date", "datetime", "timestamp"]:
            d = datetime.now() - timedelta(days=random.randint(0, 730))
            return d.strftime("%Y-%m-%d") if ctype == "date" else d.isoformat()

        if ctype in ["bool", "boolean"]:
            return random.choice([True, False])

        return fake.word()

    def generate_table_data(self, table, count):
        table_def = self.schema["tables"][table]
        columns = table_def["columns"]
        records = []

        patterns = {
            c["name"]: self.analyze_column_patterns(table, c["name"])
            for c in columns
        }

        self.pk_counters.setdefault(table, 1)

        for _ in range(count):
            row = {}
            for col in columns:
                if col.get("primary_key"):
                    row[col["name"]] = self.pk_counters[table]
                    self.pk_counters[table] += 1
                else:
                    row[col["name"]] = self.generate_value(
                        col, patterns.get(col["name"])
                    )
            records.append(row)

        return records

    def generate_all_data(self, record_counts):
        for table, count in record_counts.items():
            self.generated_data[table] = self.generate_table_data(table, count)
        return self.generated_data

# =====================================================
# CSV HELPER
# =====================================================
def dict_list_to_csv(data):
    if not data:
        return ""
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=data[0].keys())
    writer.writeheader()
    for row in data:
        writer.writerow({k: "" if v is None else v for k, v in row.items()})
    return output.getvalue()

def format_data_for_response(data, format_type):
    """Format data based on requested format"""
    if format_type == "csv":
        return {t: dict_list_to_csv(r) for t, r in data.items()}
    return data

# =====================================================
# API ENDPOINTS
# =====================================================

@app.route("/api/generate", methods=["POST"])
def generate_data():
    """Generate base data WITHOUT errors and store it permanently"""
    try:
        data = request.json
        schema = data["schema"]
        sample_data = data.get("sampleData", {})
        record_counts = data["recordCounts"]
        output_format = data.get("outputFormat", "json")
        
        # Get or create session
        session_id = data.get("session_id")
        if not session_id or not SessionManager.get_session(session_id):
            session_id = SessionManager.create_session()
        
        # Generate base data (NO ERRORS)
        generator = SyntheticDataGenerator(schema, sample_data)
        base_data = generator.generate_all_data(record_counts)
        
        # Store base data permanently
        base_data_key = f"base_{session_id}_{int(time.time())}"
        SessionManager.store_base_data(
            session_id, 
            base_data_key, 
            base_data,
            metadata={
                "schema": schema,
                "record_counts": record_counts,
                "generated_at": datetime.now().isoformat()
            }
        )
        
        # Return base data without errors
        formatted_data = format_data_for_response(base_data, output_format)
        
        return jsonify({
            "format": output_format,
            "data": formatted_data,
            "error_logs": [],  # No errors in base data
            "session_id": session_id,
            "data_key": base_data_key,
            "data_type": "base",
            "storage_status": "stored",
            "message": "Base data generated without errors"
        })
        
    except Exception as e:
        return jsonify({
            "error": str(e),
            "traceback": traceback.format_exc()
        }), 500

@app.route("/api/apply-errors", methods=["POST"])
def apply_errors():
    """Apply error injection to existing base data"""
    try:
        data = request.json
        base_data_key = data.get("base_data_key")
        error_config = data.get("error_config", DEFAULT_ERROR_CONFIG)
        output_format = data.get("outputFormat", "json")
        
        if not base_data_key:
            return jsonify({"error": "base_data_key is required"}), 400
        
        # Get base data
        base_data = SessionManager.get_data(base_data_key, get_base=True)
        if not base_data:
            return jsonify({"error": "Base data not found"}), 404
        
        # Get schema from stored metadata
        data_info = SessionManager.get_data_info(base_data_key)
        if not data_info or data_info["type"] != "base":
            return jsonify({"error": "Invalid base data key"}), 400
        
        schema = data_info["info"]["metadata"].get("schema")
        if not schema:
            return jsonify({"error": "Schema not found in base data"}), 400
        
        # Apply errors to a copy of base data
        modified_data, error_logs = apply_error_injection_to_copy(
            base_data, schema, error_config
        )
        
        # Store modified data
        session_id = data_info["info"]["session_id"]
        modified_data_key = f"modified_{base_data_key}_{int(time.time())}"
        SessionManager.store_modified_data(
            session_id,
            modified_data_key,
            base_data_key,
            modified_data,
            error_config,
            error_logs
        )
        
        # Format response
        formatted_data = format_data_for_response(modified_data, output_format)
        
        return jsonify({
            "format": output_format,
            "data": formatted_data,
            "error_logs": error_logs,
            "session_id": session_id,
            "base_data_key": base_data_key,
            "modified_data_key": modified_data_key,
            "data_type": "modified",
            "error_config": error_config,
            "storage_status": "stored",
            "message": "Errors applied to base data"
        })
        
    except Exception as e:
        return jsonify({
            "error": str(e),
            "traceback": traceback.format_exc()
        }), 500

@app.route("/api/data/<data_key>", methods=["GET"])
def get_stored_data(data_key):
    """Retrieve stored data by key"""
    try:
        data = SessionManager.get_data(data_key)
        if not data:
            return jsonify({"error": "Data not found"}), 404
        
        format_type = request.args.get("format", "json")
        data_info = SessionManager.get_data_info(data_key)
        
        response_data = format_data_for_response(data, format_type)
        
        response = {
            "format": format_type,
            "data": response_data,
            "data_key": data_key,
            "retrieved_at": datetime.now().isoformat()
        }
        
        if data_info:
            if data_info["type"] == "modified":
                response.update({
                    "data_type": "modified",
                    "base_data_key": data_info["info"]["base_data_key"],
                    "error_config": data_info["info"]["error_config"],
                    "error_logs": data_info["info"]["error_logs"]
                })
            else:
                response.update({
                    "data_type": "base",
                    "metadata": data_info["info"]["metadata"]
                })
        
        return jsonify(response)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/data/<data_key>/base", methods=["GET"])
def get_base_data(data_key):
    """Get the base data for a modified data set"""
    try:
        # Check if this is a modified data key
        base_data_key = SessionManager.get_base_data_for_modified(data_key)
        
        if base_data_key:
            # Get the original base data
            base_data = SessionManager.get_data(base_data_key, get_base=True)
            if base_data:
                format_type = request.args.get("format", "json")
                formatted_data = format_data_for_response(base_data, format_type)
                
                return jsonify({
                    "format": format_type,
                    "data": formatted_data,
                    "data_key": base_data_key,
                    "original_data_key": data_key,
                    "data_type": "base",
                    "retrieved_at": datetime.now().isoformat()
                })
        
        # If not modified or base not found, try to get as regular data
        return get_stored_data(data_key)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/data/<base_data_key>/modifications", methods=["GET"])
def get_modifications(base_data_key):
    """Get all modified versions of a base data set"""
    try:
        modifications = {}
        
        # Find all modified data sets that use this base
        for mod_key, mod_data in DATA_STORAGE["modified_data"].items():
            if mod_data["base_data_key"] == base_data_key:
                modifications[mod_key] = {
                    "error_config": mod_data["error_config"],
                    "error_logs_count": len(mod_data.get("error_logs", [])),
                    "created_at": mod_data["created_at"]
                }
        
        return jsonify({
            "base_data_key": base_data_key,
            "modifications": modifications,
            "count": len(modifications)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/data/preview", methods=["POST"])
def create_preview():
    """Create and store a destination preview"""
    try:
        data = request.json
        data_key = data.get("data_key")
        preview_data = data.get("preview_data")
        destination_type = data.get("destination_type", "unknown")
        
        if not data_key or not preview_data:
            return jsonify({"error": "Missing required parameters"}), 400
        
        preview_id = SessionManager.store_preview(data_key, preview_data, destination_type)
        
        return jsonify({
            "preview_id": preview_id,
            "data_key": data_key,
            "destination_type": destination_type,
            "status": "preview_created"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/data/preview/<data_key>", methods=["GET"])
def get_preview(data_key):
    """Get destination previews for stored data"""
    try:
        destination_type = request.args.get("destination_type")
        previews = SessionManager.get_preview(data_key, destination_type)
        
        if not previews:
            return jsonify({"error": "No previews found"}), 404
        
        return jsonify({
            "data_key": data_key,
            "previews": previews,
            "count": len(previews)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/session/<session_id>", methods=["GET"])
def get_session_data(session_id):
    """Get all data associated with a session"""
    try:
        session = SessionManager.get_session(session_id)
        if not session:
            return jsonify({"error": "Session not found"}), 404
        
        # Get all data for this session
        base_data_summary = {}
        for data_key in session["base_data_keys"]:
            data = SessionManager.get_data(data_key, get_base=True)
            if data:
                base_data_summary[data_key] = {
                    "tables": list(data.keys()),
                    "row_counts": {t: len(rows) for t, rows in data.items()},
                    "is_base": True
                }
        
        modified_data_summary = {}
        for data_key in session["modified_data_keys"]:
            data = SessionManager.get_data(data_key)
            if data:
                modified_data_summary[data_key] = {
                    "tables": list(data.keys()),
                    "row_counts": {t: len(rows) for t, rows in data.items()},
                    "is_base": False
                }
        
        return jsonify({
            "session_id": session_id,
            "created_at": session["created_at"],
            "base_data_keys": session["base_data_keys"],
            "modified_data_keys": session["modified_data_keys"],
            "preview_keys": session["preview_keys"],
            "base_data_count": len(session["base_data_keys"]),
            "modified_data_count": len(session["modified_data_keys"]),
            "base_data": base_data_summary,
            "modified_data": modified_data_summary
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/storage/stats", methods=["GET"])
def get_storage_stats():
    """Get storage statistics"""
    try:
        SessionManager.cleanup_expired_sessions()
        
        # Calculate total rows
        total_rows = 0
        for data in DATA_STORAGE["base_data"].values():
            for table_data in data["data"].values():
                total_rows += len(table_data)
        
        for data in DATA_STORAGE["modified_data"].values():
            for table_data in data["data"].values():
                total_rows += len(table_data)
        
        stats = {
            "sessions_count": len(DATA_STORAGE["sessions"]),
            "base_data_items": len(DATA_STORAGE["base_data"]),
            "modified_data_items": len(DATA_STORAGE["modified_data"]),
            "previews_count": len(DATA_STORAGE["previews"]),
            "active_sessions": sum(1 for s in DATA_STORAGE["sessions"].values() 
                                 if s["status"] == "active"),
            "total_rows": total_rows,
            "last_cleanup": datetime.now().isoformat()
        }
        
        return jsonify(stats)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/health")
def health():
    return jsonify({
        "status": "healthy",
        "storage_available": True,
        "timestamp": datetime.now().isoformat()
    })

@app.route("/api/status")
def status():
    """Comprehensive system status"""
    SessionManager.cleanup_expired_sessions()
    
    return jsonify({
        "status": "operational",
        "storage": {
            "sessions": len(DATA_STORAGE["sessions"]),
            "base_data": len(DATA_STORAGE["base_data"]),
            "modified_data": len(DATA_STORAGE["modified_data"]),
            "previews": len(DATA_STORAGE["previews"]),
            "memory_usage": "in_memory"
        },
        "services": {
            "data_generation": "active",
            "data_storage": "active",
            "error_injection": "active",
            "preview_service": "active",
            "session_management": "active"
        },
        "timestamp": datetime.now().isoformat()
    })

# =====================================================
# MAIN
# =====================================================
if __name__ == "__main__":
    # Initial cleanup
    SessionManager.cleanup_expired_sessions()
    
    app.run(debug=True, host="0.0.0.0", port=5000)