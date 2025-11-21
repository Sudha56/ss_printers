import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

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

document.getElementById("orderForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    // Validation: make sure fields are not empty
    const clientName = document.getElementById("clientName").value.trim();
    if (!clientName) {
        alert("Please enter client name");
        return;
    }

    const orderData = {
        clientName,
        productType: document.getElementById("productType").value.trim(),
        quantity: parseInt(document.getElementById("quantity").value) || 0,
        materialType: document.getElementById("materialType").value.trim(),
        materialCost: parseFloat(document.getElementById("materialCost").value) || 0,
        productionCost: parseFloat(document.getElementById("productionCost").value) || 0,
        gstPercent: parseFloat(document.getElementById("gstPercent").value) || 0,
        deliveryDate: document.getElementById("deliveryDate").value,
        mobile: document.getElementById("mobile").value.trim(),
        email: document.getElementById("email").value.trim(),
        notes: document.getElementById("notes").value.trim(),
        timestamp: Date.now()
    };

    try {
        await addDoc(collection(db, "orders"), orderData);
        document.getElementById("orderResult").innerText = "✅ Order submitted successfully!";
        document.getElementById("orderForm").reset();
    } catch (error) {
        console.error(error);
        document.getElementById("orderResult").innerText = "❌ Error submitting order!";
    }
});