from flask import Flask, request, jsonify
from flask_cors import CORS
import csv, os, smtplib
from email.mime.text import MIMEText
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
ORDER_FILE = 'orders.csv'

# Ensure folders and CSV exist
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
if not os.path.exists(ORDER_FILE):
    with open(ORDER_FILE, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['Name','Email','Product','Quantity','Delivery Date','Notes','Design File'])

# Environment variables
SMTP_EMAIL = os.getenv('SMTP_EMAIL')
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD')
SMTP_SERVER = os.getenv('SMTP_SERVER','smtp.gmail.com')
SMTP_PORT = int(os.getenv('SMTP_PORT',587))

@app.route('/place-order', methods=['POST'])
def place_order():
    # Get form data
    name = request.form.get('name')
    email = request.form.get('email')
    product = request.form.get('product')
    quantity = request.form.get('quantity')
    delivery_date = request.form.get('deliveryDate')
    notes = request.form.get('notes')

    # Optional design file
    filename = ''
    if 'designFile' in request.files:
        file = request.files['designFile']
        if file.filename != '':
            filename = secure_filename(file.filename)
            file.save(os.path.join(UPLOAD_FOLDER, filename))

    # Validate required fields
    if not all([name,email,product,quantity]):
        return jsonify({'status':'error','message':'Please fill all required fields'}),400

    # Save to CSV
    try:
        with open(ORDER_FILE,'a',newline='') as f:
            writer = csv.writer(f)
            writer.writerow([name,email,product,quantity,delivery_date,notes,filename])
    except Exception as e:
        return jsonify({'status':'error','message':f'Failed to save order: {e}'}),500

    # Send email
    try:
        if not SMTP_EMAIL or not SMTP_PASSWORD:
            return jsonify({'status':'error','message':'SMTP credentials not set'}),500

        msg = MIMEText(f"Hi {name},\n\nYour order for {quantity} x {product} has been received.\n\nThank you for ordering from SS Printers!")
        msg['Subject'] = 'Order Confirmation - SS Printers'
        msg['From'] = SMTP_EMAIL
        msg['To'] = email

        server = smtplib.SMTP(SMTP_SERVER,SMTP_PORT)
        server.starttls()
        server.login(SMTP_EMAIL,SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
    except Exception as e:
        return jsonify({'status':'error','message':f'Order saved but email failed: {e}'}),500

    return jsonify({'status':'success','message':'Order placed and email sent!'}),200

if __name__ == '__main__':
    port = int(os.getenv('PORT',5000))
    app.run(host='0.0.0.0',port=port,debug=True)
