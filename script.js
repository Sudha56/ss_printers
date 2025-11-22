const orderForm = document.getElementById('orderForm');

orderForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const product = document.getElementById('product').value;
    const quantity = document.getElementById('quantity').value;

    try {
        const response = await fetch('https://ss-printers-backend.onrender.com/place-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, product, quantity })
});


        const result = await response.json();
        alert(result.message);
        if (result.status === 'success') orderForm.reset();
    } catch (err) {
        console.error(err);
        alert('Failed to place order. Try again.');
    }
});
