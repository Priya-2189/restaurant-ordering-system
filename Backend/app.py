from flask_cors import CORS
from flask import Flask, request, jsonify
import mysql.connector
import json  # ✅ Add this import

app = Flask(__name__)
CORS(app)

# MySQL connection
db = mysql.connector.connect(
    host="localhost",
    user="restaurant",
    password="restaurant123",
    database="restaurant_app"
)
cursor = db.cursor()

# Menu items
MENU = {
    "Chicken Biryani": 250,
    "Veg Biryani": 200,
    "Paneer Tikka": 150
}

# LOGIN ROUTE
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    cursor.execute(
        "INSERT INTO customers (name, phone) VALUES (%s,%s)",
        (data["name"], data["phone"])
    )
    db.commit()
    return jsonify({"customer_id": cursor.lastrowid})

# MENU ROUTE
@app.route("/menu")
def menu():
    return jsonify(MENU)

# ORDER ROUTE
@app.route("/order", methods=["POST"])
def order():
    data = request.get_json()
    customer_id = data["customer_id"]
    items = data["items"]

    # Calculate subtotal, GST, total
    subtotal = sum(details["quantity"] * details["price"] for details in items.values())
    gst = round(subtotal * 0.07, 2)
    total = round(subtotal + gst, 2)

    # Save order in MySQL (convert dict to JSON string)
    cursor.execute(
        "INSERT INTO orders (customer_id, items, total) VALUES (%s, %s, %s)",
        (customer_id, json.dumps(items), total)
    )
    db.commit()

    return jsonify({"subtotal": subtotal, "gst": gst, "total": total})

if __name__ == "__main__":
    app.run(debug=True)
