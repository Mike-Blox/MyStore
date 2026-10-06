let cart = JSON.parse(localStorage.getItem("cart")) || [];


// =========================
// SHIPPING
// =========================

const SHIPPING_PER_ITEM = 2.99;


// =========================
// DEFAULT PRODUCT COLORS
// =========================

const defaultColors = [
    "Black",
    "White",
    "Brown",
    "Grey",
    "Blue",
    "Purple",
    "Pink",
    "Orange",
    "Yellow"
];


// =========================
// PRODUCT DATA
// =========================

const products = {

    "Rust Semi Automatic Rifle": {
        name: "Rust Semi Automatic Rifle",
        price: 24.99,
        image: "rust-rifle.jpg",
        colors: defaultColors
    },

    "Rust Revolver": {
        name: "Rust Revolver",
        price: 29.99,
        image: "images/rust-revolver.png",
        colors: defaultColors
    },

    "Rust C4 Replica": {
        name: "Rust C4 Replica",
        price: 19.99,
        image: "images/rust-c4.png",
        colors: defaultColors
    }

};


// =========================
// SELECTED COLORS
// =========================

const selectedColors = {};


// =========================
// SELECT COLOR
// =========================

function selectColor(productName, color, button) {

    selectedColors[productName] = color;

    const productCard =
        button.closest(".product-card");

    const circles =
        productCard.querySelectorAll(
            ".color-circle"
        );

    circles.forEach(circle => {
        circle.classList.remove("selected");
    });

    button.classList.add("selected");

    const colorName =
        productCard.querySelector(
            ".selected-color-name"
        );

    if (colorName) {
        colorName.textContent = color;
    }

}


// =========================
// ADD TO CART
// =========================

function addToCart(productName) {

    const product =
        products[productName];

    if (!product) {

        alert(
            "Product could not be found."
        );

        return;
    }


    const selectedColor =
        selectedColors[productName];


    if (!selectedColor) {

        alert(
            "Please select a color first."
        );

        return;
    }


    const cartProduct = {

        name: product.name,

        price: product.price,

        image: product.image,

        color: selectedColor

    };


    cart.push(cartProduct);


    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );


    alert(
        product.name +
        " (" +
        selectedColor +
        ") added to cart!"
    );

}


// =========================
// LOAD CART
// =========================

function loadCart() {

    const cartItems =
        document.getElementById(
            "cart-items"
        );

    const cartSubtotal =
        document.getElementById(
            "cart-subtotal"
        );

    const cartShipping =
        document.getElementById(
            "cart-shipping"
        );

    const cartTotal =
        document.getElementById(
            "cart-total"
        );


    if (!cartItems) {
        return;
    }


    cartItems.innerHTML = "";


    let subtotal = 0;


    if (cart.length === 0) {

        cartItems.innerHTML = `

            <div class="empty-cart">

                <h2>
                    Your cart is empty
                </h2>

                <p>
                    Add a product to your cart
                    to get started.
                </p>

                <a
                    href="products.html"
                    class="shop-button"
                >
                    Shop Now
                </a>

            </div>

        `;


        if (cartSubtotal) {
            cartSubtotal.textContent = "0.00";
        }

        if (cartShipping) {
            cartShipping.textContent = "0.00";
        }

        if (cartTotal) {
            cartTotal.textContent = "0.00";
        }


        return;
    }


    cart.forEach(
        (product, index) => {

            subtotal += product.price;


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "cart-item";


            item.innerHTML = `

                <img
                    src="${product.image || ""}"
                    alt="${product.name}"
                    class="cart-product-image"
                >


                <div class="cart-product-info">

                    <h2>
                        ${product.name}
                    </h2>

                    <p class="cart-product-color">
                        Color:
                        <strong>
                            ${product.color || "Not Selected"}
                        </strong>
                    </p>

                    <p class="cart-product-price">
                        $${product.price.toFixed(2)}
                    </p>

                </div>


                <button
                    class="remove-button"
                    onclick="removeFromCart(${index})"
                >
                    Remove
                </button>

            `;


            cartItems.appendChild(item);

        }
    );


    const shipping =
        cart.length * SHIPPING_PER_ITEM;


    const total =
        subtotal + shipping;


    if (cartSubtotal) {

        cartSubtotal.textContent =
            subtotal.toFixed(2);

    }


    if (cartShipping) {

        cartShipping.textContent =
            shipping.toFixed(2);

    }


    if (cartTotal) {

        cartTotal.textContent =
            total.toFixed(2);

    }

}


// =========================
// REMOVE FROM CART
// =========================

function removeFromCart(index) {

    cart.splice(index, 1);


    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );


    loadCart();

}


// =========================
// GO TO CHECKOUT
// =========================

function checkout() {

    if (cart.length === 0) {

        alert(
            "Your cart is empty!"
        );

        return;
    }


    window.location.href =
        "checkout.html";

}


// =========================
// LOAD CHECKOUT
// =========================

function loadCheckout() {

    const checkoutItems =
        document.getElementById(
            "checkout-items"
        );

    const checkoutSubtotal =
        document.getElementById(
            "checkout-subtotal"
        );

    const checkoutShipping =
        document.getElementById(
            "checkout-shipping"
        );

    const checkoutTotal =
        document.getElementById(
            "checkout-total"
        );


    if (!checkoutItems) {
        return;
    }


    checkoutItems.innerHTML = "";


    let subtotal = 0;


    cart.forEach(
        (product) => {

            subtotal += product.price;


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "checkout-item";


            item.innerHTML = `

                <p>
                    <strong>
                        ${product.name}
                    </strong>
                </p>

                <p>
                    Color:
                    ${product.color || "Not Selected"}
                </p>

                <p>
                    $${product.price.toFixed(2)}
                </p>

            `;


            checkoutItems.appendChild(item);

        }
    );


    const shipping =
        cart.length * SHIPPING_PER_ITEM;


    const total =
        subtotal + shipping;


    if (checkoutSubtotal) {

        checkoutSubtotal.textContent =
            subtotal.toFixed(2);

    }


    if (checkoutShipping) {

        checkoutShipping.textContent =
            shipping.toFixed(2);

    }


    if (checkoutTotal) {

        checkoutTotal.textContent =
            total.toFixed(2);

    }

}


// =========================
// PAYMENT METHOD
// =========================

let selectedPayment = null;


function selectPayment(method) {

    selectedPayment = method;


    const message =
        document.getElementById(
            "payment-message"
        );


    const zelleInstructions =
        document.getElementById(
            "zelle-instructions"
        );


    const cashAppInstructions =
        document.getElementById(
            "cashapp-instructions"
        );


    if (zelleInstructions) {
        zelleInstructions.style.display =
            "none";
    }


    if (cashAppInstructions) {
        cashAppInstructions.style.display =
            "none";
    }


    if (method === "zelle") {

        message.textContent =
            "Zelle payment selected.";


        zelleInstructions.style.display =
            "block";

    }


    if (method === "cashapp") {

        message.textContent =
            "Cash App payment selected.";


        cashAppInstructions.style.display =
            "block";

    }

}


// =========================
// PLACE ORDER
// =========================

async function placeOrder() {

    const name =
        document.getElementById(
            "customer-name"
        ).value;


    const email =
        document.getElementById(
            "customer-email"
        ).value;


    const address =
        document.getElementById(
            "address"
        ).value;


    const city =
        document.getElementById(
            "city"
        ).value;


    const state =
        document.getElementById(
            "state"
        ).value;


    const zip =
        document.getElementById(
            "zip"
        ).value;


    if (
        name === "" ||
        email === ""
    ) {

        alert(
            "Please enter your name and email."
        );

        return;
    }


    if (
        selectedPayment === null
    ) {

        alert(
            "Please select a payment method."
        );

        return;
    }


    if (
        cart.length === 0
    ) {

        alert(
            "Your cart is empty."
        );

        return;
    }


    const shipping =
        cart.length * SHIPPING_PER_ITEM;


    const order = {

        customer: {

            name: name,

            email: email

        },


        shipping: {

            address: address,

            city: city,

            state: state,

            zip: zip,

            cost: shipping

        },


        items: cart,


        paymentMethod:
            selectedPayment

    };


    try {

        const response =
            await fetch(
                "/api/orders",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(order)

                }
            );


        const result =
            await response.json();


        if (result.success) {

            localStorage.setItem(
                "lastOrderId",
                result.orderId
            );


            localStorage.setItem(
                "lastPaymentMethod",
                selectedPayment
            );


            cart = [];


            localStorage.setItem(
                "cart",
                JSON.stringify(cart)
            );


            window.location.href =
                "success.html";

        }

        else {

            alert(
                "There was a problem creating your order."
            );

        }

    }

    catch (error) {

        console.error(error);


        alert(
            "Could not connect to the store server."
        );

    }

}


// =========================
// LOAD PAGE DATA
// =========================

loadCart();

loadCheckout();