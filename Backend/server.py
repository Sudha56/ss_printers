from flask import Flask, request, jsonify
from flask_mail import Mail, Message
from werkzeug.utils import secure_filename
import os
import csv
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Flask-Mail configuration
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USE_SSL'] = True
app.config['MAIL_USERNAME'] = os.environ.get('EMAIL_USER')
app.config['MAIL_PASSWORD'] = os.environ.get('EMAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('EMAIL_FROM')

mail = Mail(app)

# Upload folder
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# CSV file to save orders
CSV_FILE = 'orders.csv'
if not os.path.exists(CSV_FILE):
    with open(CSV_FILE, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['Order ID','Client','Product','Quantity','Delivery Date','Email','Notes','File Name'])

@app.route('/orders', methods=['POST'])
def place_order():
    # Get form data
    data = request.form
    file = request.files.get('design_file')

    order_id = f"ORD-{sum(1 for row in open(CSV_FILE))-1:03d}"

    filename = ''
    if file:
        filename = secure_filename(file.filename)
        file.save(os.path.join(UPLOAD_FOLDER, filename))

    # Save to CSV
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

    # Send confirmation email
    try:
        msg = Message(
            subject=f"SS Printers Order Confirmation - {order_id}",
            recipients=[data.get('email')]
        )
        msg.body = f"""
Dear {data.get('client')},

Your order has been received successfully!

Order ID: {order_id}
Product: {data.get('product')}
Quantity: {data.get('quantity')}
Delivery Date: {data.get('delivery_date')}
Notes: {data.get('notes')}

Thank you for choosing SS Printers!
"""
        mail.send(msg)
    except Exception as e:
        print("Email sending failed:", e)

    return jsonify({'ok': True, 'order_id': order_id, 'message': 'Order submitted successfully!'})

if __name__ == '__main__':
    app.run(debug=True)
