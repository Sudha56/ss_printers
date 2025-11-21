from flask import Flask, request, jsonify, send_from_directory
from flask_mail import Mail, Message
from werkzeug.utils import secure_filename
import os
import csv

# Load environment variables (optional if using .env)
from dotenv import load_dotenv
load_dotenv()

# Flask app
app = Flask(__name__)

# Upload folder
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# CSV file
CSV_FILE = 'orders.csv'
if not os.path.exists(CSV_FILE):
    with open(CSV_FILE, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['Order ID','Client','Product','Quantity','Delivery Date','Email','Notes','File Name'])

# Flask-Mail config
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USE_SSL'] = True
app.config['MAIL_USERNAME'] = os.environ.get('EMAIL_USER')          # Your email
app.config['MAIL_PASSWORD'] = os.environ.get('EMAIL_PASSWORD')      # App password
app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('EMAIL_FROM')    # Usually same as EMAIL_USER

mail = Mail(app)

# Serve index.html
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

# Order submission route
@app.route('/orders', methods=['POST'])
def place_order():
    data = request.form
    file = request.files.get('design_file')

    # Generate Order ID
    with open(CSV_FILE) as f:
        order_id = f"ORD-{sum(1 for row in f)-1:03d}"

    filename = ''
    if file:
        filename = secure_filename(file.filename)
        file.save(os.path.join(UPLOAD_FOLDER, filename))

    # Save order to CSV
    with open(CSV_FILE, 'a', newline='') as f:
        writer = csv.writer(f)
        writer.writerow([
            order_id,
            data.get('client'),
            data.get('product'),
            data.get('quantity'),
            data.get('delivery_date'),
            data.get('email'),
            data.get('notes'),
            filename
        ])

    # Send email to company and client
    try:
        # Email to company
        company_email = os.environ.get('EMAIL_USER')  # Or your official company email
        msg = Message(
            subject=f"New SS Printers Order - {order_id}",
            recipients=[company_email]
        )
        msg.body = f"""
New order received!

Order ID: {order_id}
Client: {data.get('client')}
Product: {data.get('product')}
Quantity: {data.get('quantity')}
Delivery Date: {data.get('delivery_date')}
Mobile: {data.get('mobile')}
Email: {data.get('email')}
Notes: {data.get('notes')}
"""
        # Attach file if uploaded
        if filename:
            with app.open_resource(os.path.join(UPLOAD_FOLDER, filename)) as fp:
                msg.attach(filename, "application/octet-stream", fp.read())

        mail.send(msg)

        # Email to client (optional)
        if data.get('email'):
            client_msg = Message(
                subject=f"SS Printers Order Confirmation - {order_id}",
                recipients=[data.get('email')]
            )
            client_msg.body = f"""
Dear {data.get('client')},

Your order has been received successfully!

Order ID: {order_id}
Product: {data.get('product')}
Quantity: {data.get('quantity')}
Delivery Date: {data.get('delivery_date')}
Notes: {data.get('notes')}

Thank you for choosing SS Printers!
"""
            mail.send(client_msg)

    except Exception as e:
        print("Email sending failed:", e)

    return jsonify({'ok': True, 'order_id': order_id, 'message': 'Order submitted successfully!'})

# Run app
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=True)
