from flask import Flask, request, jsonify
from flask_cors import CORS
import random
from datetime import datetime, timedelta
from faker import Faker
import numpy as np
import csv
import io
import traceback

# =====================================================
# FLASK SETUP
# =====================================================
app = Flask(__name__)
CORS(app)
fake = Faker()

# =====================================================
# ERROR INJECTION DEFAULT CONFIG
# =====================================================
DEFAULT_ERROR_CONFIG = {
    "enabled": False,
    "error_percentage": 0.0,   # 0.05 = 5%
    "error_types": []          # ["date", "string_length"]
}

# =====================================================
# GLOBAL ERROR LOG STORE (PER REQUEST)
# =====================================================
ERROR_LOGS = []

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

def apply_error_injection(records, table_schema, table_name, error_config):
    if not error_config.get("enabled"):
        return records

    error_rate = error_config.get("error_percentage", 0)
    error_types = error_config.get("error_types", [])

    total_rows = len(records)
    error_rows = int(total_rows * error_rate)

    if error_rows <= 0:
        return records

    row_indexes = random.sample(range(total_rows), error_rows)

    for row_idx in row_indexes:
        row = records[row_idx]

        for col_name, col_def in table_schema.items():
            col_type = col_def.get("type", "").lower()

            # DATE ERRORS
            if "date" in error_types and col_type in ["date", "datetime", "timestamp"]:
                bad_value = inject_date_error()
                row[col_name] = bad_value

                ERROR_LOGS.append({
                    "table": table_name,
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

                ERROR_LOGS.append({
                    "table": table_name,
                    "generated_row": row_idx,
                    "column": col_name,
                    "error_message": "String length exceeds allowed limit",
                    "invalid_value": bad_value
                })

    return records

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

# =====================================================
# API ENDPOINT
# =====================================================
@app.route("/api/generate", methods=["POST"])
def generate_data():
    try:
        ERROR_LOGS.clear()  # reset per request

        data = request.json
        schema = data["schema"]
        sample_data = data.get("sampleData", {})
        record_counts = data["recordCounts"]
        output_format = data.get("outputFormat", "csv")
        error_config = data.get("error_config", DEFAULT_ERROR_CONFIG)

        generator = SyntheticDataGenerator(schema, sample_data)
        generated = generator.generate_all_data(record_counts)

        # APPLY ERROR INJECTION + LOGGING
        for table, rows in generated.items():
            table_schema = {
                c["name"]: c for c in schema["tables"][table]["columns"]
            }
            generated[table] = apply_error_injection(
                rows, table_schema, table, error_config
            )

        if output_format == "csv":
            return jsonify({
                "format": "csv",
                "data": {t: dict_list_to_csv(r) for t, r in generated.items()},
                "error_logs": ERROR_LOGS
            })

        return jsonify({
            "format": "json",
            "data": generated,
            "error_logs": ERROR_LOGS
        })

    except Exception as e:
        return jsonify({
            "error": str(e),
            "traceback": traceback.format_exc()
        }), 500

# =====================================================
# HEALTH
# =====================================================
@app.route("/api/health")
def health():
    return jsonify({"status": "healthy"})

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
