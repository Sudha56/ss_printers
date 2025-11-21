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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const orderForm = document.getElementById("orderForm");
const resultDiv = document.getElementById("orderResult");

orderForm.addEventListener("submit", async function(e) {
    e.preventDefault();

    // Clear previous messages
    resultDiv.innerText = "";

    // Collect form values
    const clientName = document.getElementById("clientName").value.trim();
    const productType = document.getElementById("productType").value.trim();
    const quantity = parseInt(document.getElementById("quantity").value) || 0;
    const deliveryDate = document.getElementById("deliveryDate").value;
    const mobile = document.getElementById("mobile").value.trim();
    const email = document.getElementById("email").value.trim();
    const notes = document.getElementById("notes").value.trim();
    const fileInput = document.getElementById("designFile");

    // Validation
    if (!clientName || !productType || quantity <= 0 || !deliveryDate || !email) {
        resultDiv.innerText = "❌ Please fill all required fields correctly.";
        return;
    }

    // Upload file if exists
    let fileURL = "";
    if (fileInput && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const storageRef = ref(storage, `orders/${Date.now()}_${file.name}`);
        try {
            const snapshot = await uploadBytes(storageRef, file);
            fileURL = await getDownloadURL(snapshot.ref);
        } catch (err) {
            console.error("File upload error:", err);
            resultDiv.innerText = "❌ Error uploading file: " + err.message;
            return;
        }
    }

    // Prepare order object
    const orderData = {
        clientName,
        productType,
        quantity,
        deliveryDate,
        mobile,
        email,
        notes,
        fileURL,
        timestamp: serverTimestamp()
    };

    // Submit order to Firestore
    try {
        await addDoc(collection(db, "orders"), orderData);
        resultDiv.innerText = "✅ Order submitted successfully!";

        // Open default email client with pre-filled order details
        const subject = encodeURIComponent(`New Order from ${clientName}`);
        const body = encodeURIComponent(`
Client: ${clientName}
Product: ${productType}
Quantity: ${quantity}
Delivery Date: ${deliveryDate}
Email: ${email}
Mobile: ${mobile}
Notes: ${notes}
File URL: ${fileURL || "No file"}
        `);

        window.location.href = `mailto:sudha13004@gmail.com?subject=${subject}&body=${body}`;

        orderForm.reset();
    } catch (error) {
        console.error("Firestore submission error:", error);
        resultDiv.innerText = "❌ Error submitting order: " + error.message;
    }
});
