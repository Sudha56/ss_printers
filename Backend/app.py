from flask import Flask, request, jsonify
import csv
import os
import smtplib
from email.mime.text import MIMEText
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow frontend requests

# Environment variables (set in Render or locally)
SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
SMTP_PORT = int(os.getenv('SMTP_PORT', 587))
SMTP_EMAIL = os.getenv('SMTP_EMAIL')
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD')
ORDER_FILE = 'orders.csv'

# Ensure orders.csv exists
if not os.path.exists(ORDER_FILE):
    with open(ORDER_FILE, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['Name', 'Email', 'Product', 'Quantity'])

@app.route('/place-order', methods=['POST'])
def place_order():
    data = request.get_json()

    name = data.get('name')
    email = data.get('email')
    product = data.get('product')
    quantity = data.get('quantity')

    if not all([name, email, product, quantity]):
        return jsonify({'status': 'error', 'message': 'Please fill all fields'}), 400

    # Save order to CSV
    try:
        with open(ORDER_FILE, 'a', newline='') as f:
            writer = csv.writer(f)
            writer.writerow([name, email, product, quantity])
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Failed to save order: {e}'}), 500

    # Check SMTP credentials
    if not SMTP_EMAIL or not SMTP_PASSWORD:
        return jsonify({'status': 'error', 'message': 'SMTP credentials not set'}), 500

    # Send confirmation email
    try:
        msg = MIMEText(f"Hi {name},\n\nYour order for {quantity} x {product} has been received. Thank you for ordering from SS Printers!")
        msg['Subject'] = 'Order Confirmation - SS Printers'
        msg['From'] = SMTP_EMAIL
        msg['To'] = email

        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Order saved but email failed: {e}'}), 500

    return jsonify({'status': 'success', 'message': 'Order placed and email sent!'}), 200

if __name__ == '__main__':
    # Use port from environment (Render provides PORT)
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
