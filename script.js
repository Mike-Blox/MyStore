let cart = JSON.parse(localStorage.getItem("cart")) || [];


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


    // Find the product card

    const productCard =
        button.closest(".product-card");


    // Remove selected class from other circles

    const circles =
        productCard.querySelectorAll(
            ".color-circle"
        );


    circles.forEach(circle => {

        circle.classList.remove(
            "selected"
        );

    });


    // Select clicked circle

    button.classList.add(
        "selected"
    );


    // Show selected color name

    const colorName =
        productCard.querySelector(
            ".selected-color-name"
        );


    if (colorName) {

        colorName.textContent =
            color;

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


    // Require a color

    if (!selectedColor) {

        alert(
            "Please select a color first."
        );

        return;

    }


    // Create a separate cart item

    const cartProduct = {

        name: product.name,

        price: product.price,

        image: product.image,

        color: selectedColor

    };


    cart.push(
        cartProduct
    );


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


    const cartTotal =
        document.getElementById(
            "cart-total"
        );


    if (!cartItems) {
        return;
    }


    cartItems.innerHTML = "";

    let total = 0;


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


        cartTotal.textContent =
            "0.00";


        return;

    }


    cart.forEach(
        (product, index) => {

            total += product.price;


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


            cartItems.appendChild(
                item
            );

        }
    );


    cartTotal.textContent =
        total.toFixed(2);

}


// =========================
// REMOVE FROM CART
// =========================

function removeFromCart(index) {

    cart.splice(
        index,
        1
    );


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


    const checkoutTotal =
        document.getElementById(
            "checkout-total"
        );


    if (!checkoutItems) {
        return;
    }


    checkoutItems.innerHTML = "";

    let total = 0;


    cart.forEach(
        (product) => {

            total += product.price;


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


            checkoutItems.appendChild(
                item
            );

        }
    );


    checkoutTotal.textContent =
        total.toFixed(2);

}


// =========================
// PAYMENT METHOD
// =========================

let selectedPayment = null;


function selectPayment(method) {

    selectedPayment =
        method;


    const message =
        document.getElementById(
            "payment-message"
        );


    const zelleInstructions =
        document.getElementById(
            "zelle-instructions"
        );


    if (method === "zelle") {

        message.textContent =
            "Zelle payment selected.";


        zelleInstructions.style.display =
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


    // Check customer information

    if (
        name === "" ||
        email === ""
    ) {

        alert(
            "Please enter your name and email."
        );

        return;

    }


    // Check payment method

    if (
        selectedPayment === null
    ) {

        alert(
            "Please select a payment method."
        );

        return;

    }


    // Check cart

    if (
        cart.length === 0
    ) {

        alert(
            "Your cart is empty."
        );

        return;

    }


    // Create order

    const order = {

        customer: {

            name: name,

            email: email

        },


        shipping: {

            address: address,

            city: city,

            state: state,

            zip: zip

        },


        items: cart,


        paymentMethod:
            selectedPayment

    };


    // Send order to server

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
                        JSON.stringify(
                            order
                        )

                }
            );


        const result =
            await response.json();


        if (
            result.success
        ) {

            // Save order information

            localStorage.setItem(
                "lastOrderId",
                result.orderId
            );


            localStorage.setItem(
                "lastPaymentMethod",
                selectedPayment
            );


            // Clear cart

            cart = [];


            localStorage.setItem(
                "cart",
                JSON.stringify(cart)
            );


            // Go to confirmation page

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

        console.error(
            error
        );


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