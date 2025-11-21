import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

// Firebase Config
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
const orderResult = document.getElementById("orderResult");

orderForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    orderResult.innerText = "";

    const clientName = document.getElementById("clientName").value.trim();
    const productType = document.getElementById("productType").value.trim();
    const quantity = parseInt(document.getElementById("quantity").value) || 0;
    const deliveryDate = document.getElementById("deliveryDate").value;
    const mobile = document.getElementById("mobile").value.trim();
    const email = document.getElementById("email").value.trim();
    const notes = document.getElementById("notes").value.trim();
    const fileInput = document.getElementById("designFile");

    if (!clientName || !productType || quantity <= 0 || !deliveryDate || !email) {
        orderResult.innerText = "❌ Please fill all required fields.";
        return;
    }

    // Upload file if exists
    let fileURL = "";
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const storageRef = ref(storage, `orders/${Date.now()}_${file.name}`);
        try {
            const snapshot = await uploadBytes(storageRef, file);
            fileURL = await getDownloadURL(snapshot.ref);
        } catch (err) {
            console.error("File upload error:", err);
            orderResult.innerText = "❌ File upload failed.";
            return;
        }
    }

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

    try {
        await addDoc(collection(db, "orders"), orderData);
        orderResult.innerText = "✅ Order submitted successfully!";
        orderForm.reset();
    } catch (err) {
        console.error(err);
        orderResult.innerText = "❌ Failed to submit order.";
    }
});
