let customerId = null;
let menuData = {};
let selectedItems = {};

// ----- HOME → LOGIN -----
function goToLogin() {
    document.getElementById("home").style.display = "none";
    document.getElementById("login").style.display = "block";
}

// ----- LOGIN → MENU -----
function submitLogin() {
    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();

    if (name === "" || phone === "") {
        alert("Please enter name and phone");
        return;
    }

    fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ name, phone })
    })
    .then(res => res.json())
    .then(data => {
        customerId = data.customer_id;
        document.getElementById("login").style.display = "none";
        document.getElementById("menu").style.display = "block";
        loadMenu();
    })
    .catch(err => {
        console.error(err);
        alert("Backend not responding");
    });
}

// ----- LOAD MENU -----
function loadMenu() {
    fetch("http://127.0.0.1:5000/menu")
    .then(res => res.json())
    .then(menu => {
        menuData = menu;
        let html = "";
        for (let item in menu) {
            html += `
                <div>
                    ${item} - ₹${menu[item]}
                    <input type="number" id="qty-${item}" value="0" min="0">
                </div>
            `;
        }
        document.getElementById("menuItems").innerHTML = html;
    });
}
//--menu bill--//
function placeOrder() {
    selectedItems = {};
    for (let item in menuData) {
    let qty = parseInt(document.getElementById(`qty-${item}`).value) || 0;
    if (qty > 0) {
        selectedItems[item] = { quantity: qty, price: menuData[item] };
    }
 }


    if (Object.keys(selectedItems).length === 0) {
        alert("Select at least one item");
        return;
    }

    fetch("http://127.0.0.1:5000/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_id: customerId, items: selectedItems })
    })
    .then(res => res.json())
    .then(data => {
        showBill(data);
    })
    .catch(err => {
        console.error(err);
        alert("Error placing order");
    });
}

function showBill(data) {
    document.getElementById("menu").style.display = "none";
    document.getElementById("bill").style.display = "block";

    let html = `<p>Subtotal: ₹${data.subtotal}</p>
                <p>GST: ₹${data.gst}</p>
                <p>Total: ₹${data.total}</p>
                <p>Thank you! Visit Again.</p>`;

    document.getElementById("billDetails").innerHTML = html;
}

// ----- BILL → HOME -----
function goToHome() {
    document.getElementById("bill").style.display = "none";
    document.getElementById("home").style.display = "block";
    document.getElementById("name").value = "";
    document.getElementById("phone").value = "";
}
