// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyDPhLu10o_ce_1PW-_sP0MZGN8o_bMfZtk",
    authDomain: "ss-printers.firebaseapp.com",
    projectId: "ss-printers",
    storageBucket: "ss-printers.firebasestorage.app",
    messagingSenderId: "625571268370",
    appId: "1:625571268370:web:221090a300511c1ff4d5cb"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Handle form submit
document.getElementById("orderForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const orderData = {
        clientName: document.getElementById("clientName").value,
        productType: document.getElementById("productType").value,
        quantity: document.getElementById("quantity").value,
        materialType: document.getElementById("materialType").value,
        materialCost: document.getElementById("materialCost").value,
        productionCost: document.getElementById("productionCost").value,
        gstPercent: document.getElementById("gstPercent").value,
        deliveryDate: document.getElementById("deliveryDate").value,
        mobile: document.getElementById("mobile").value,
        email: document.getElementById("email").value,
        notes: document.getElementById("notes").value,
        timestamp: Date.now()
    };

    try {
        await addDoc(collection(db, "orders"), orderData);
        document.getElementById("orderResult").innerText = "Order submitted successfully!";
        document.getElementById("orderForm").reset();
    } catch (error) {
        console.error(error);
        document.getElementById("orderResult").innerText = "Error submitting order!";
    }
});
