from flask_mail import Mail, Message
from flask import Flask
import os

app = Flask(__name__)

app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USE_SSL'] = True
app.config['MAIL_USERNAME'] = 'sudha13004@gmail.com'
app.config['MAIL_PASSWORD'] = 'nqnu vour dres ponk'
app.config['MAIL_DEFAULT_SENDER'] = 'sudha13004@gmail.com'

mail = Mail(app)

with app.app_context():
    msg = Message(subject="Test Email",
                  recipients=["sudhajamu13004@gmail.com"],
                  body="This is a test email from SS Printers Flask app!")
    mail.send(msg)
    print("Email sent successfully!")
