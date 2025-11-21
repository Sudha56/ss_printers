// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDPhLu10o_ce_1PW-_sP0MZGN8o_bMfZtk",
    authDomain: "ss-printers.firebaseapp.com",
    projectId: "ss-printers",
    storageBucket: "ss-printers.firebasestorage.app",
    messagingSenderId: "625571268370",
    appId: "1:625571268370:web:221090a300511c1ff4d5cb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const form = document.getElementById("orderForm");
const messageDiv = document.getElementById("message");

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    messageDiv.innerText = "";

    // Collect form values
    const clientName = form.client.value.trim();
    const productType = form.product.value.trim();
    const quantity = parseInt(form.quantity.value) || 0;
    const deliveryDate = form.delivery_date.value;
    const email = form.email.value.trim();
    const notes = form.notes.value.trim();
    const fileInput = form.design_file;

    // Validation
    if (!clientName || !productType || quantity <= 0 || !deliveryDate || !email) {
        messageDiv.innerText = "❌ Please fill all required fields correctly.";
        return;
    }

    // Upload file to Firebase Storage (optional)
    let fileURL = "";
    if (fileInput && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const storageRef = ref(storage, `orders/${Date.now()}_${file.name}`);
        try {
            const snapshot = await uploadBytes(storageRef, file);
            fileURL = await getDownloadURL(snapshot.ref);
        } catch (err) {
            console.error("File upload error:", err);
            messageDiv.innerText = "❌ Error uploading file: " + err.message;
            return;
        }
    }

    // Prepare order object
    const orderData = {
        clientName,
        productType,
        quantity,
        deliveryDate,
        email,
        notes,
        fileURL,
        timestamp: serverTimestamp()
    };

    // Save order in Firestore
    try {
        await addDoc(collection(db, "orders"), orderData);
        messageDiv.innerText = "✅ Order submitted successfully!";

        // Open email client with pre-filled order details
        const subject = encodeURIComponent(`New Order from ${clientName}`);
        const body = encodeURIComponent(`
Client: ${clientName}
Product: ${productType}
Quantity: ${quantity}
Delivery Date: ${deliveryDate}
Email: ${email}
Notes: ${notes}
File URL: ${fileURL || "No file"}
        `);
        window.location.href = `mailto:sudha13004@gmail.com?subject=${subject}&body=${body}`;

        form.reset();
    } catch (error) {
        console.error("Firestore submission error:", error);
        messageDiv.innerText = "❌ Error submitting order: " + error.message;
    }
});
