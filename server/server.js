const express = require("express");
const path = require("path");
const Database = require("better-sqlite3");

require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// =========================
// PRODUCT CATALOG
// =========================

const products = {

    "Rust Semi Automatic Rifle": {
        price: 34.99
    }

};


// =========================
// DATABASE
// =========================

const dbPath = process.env.DB_PATH || path.join(__dirname, "store.db");

const db = new Database(dbPath);


// Create orders table if it doesn't exist

db.exec(`
    CREATE TABLE IF NOT EXISTS orders (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        customer_name TEXT NOT NULL,

        customer_email TEXT NOT NULL,

        address TEXT,

        city TEXT,

        state TEXT,

        zip TEXT,

        items TEXT NOT NULL,

        payment_method TEXT NOT NULL,

        status TEXT NOT NULL DEFAULT 'pending',

        created_at DATETIME DEFAULT CURRENT_TIMESTAMP

    )
`);


// =========================
// EXPRESS
// =========================

app.use(express.json());

app.get("/admin.html", adminAuth, (req, res) => {

    res.sendFile(
        path.join(__dirname, "..", "admin.html")
    );

});

// Block public access to the server folder
app.use("/server", (req, res) => {
    res.status(404).send("Not found");
});

// Serve the website files
app.use(
    express.static(
        path.join(__dirname, "..")
    )
);

function adminAuth(req, res, next) {

    const auth = req.headers.authorization;

    if (!auth || !auth.startsWith("Basic ")) {

        res.setHeader(
            "WWW-Authenticate",
            'Basic realm="My Store Admin"'
        );

        return res.status(401).send("Admin login required.");
    }

    const encoded = auth.split(" ")[1];

    let credentials;

    try {

        credentials = Buffer
            .from(encoded, "base64")
            .toString("utf8");

    } catch {

        return res.status(401).send("Invalid login.");
    }

    const separator = credentials.indexOf(":");

    if (separator === -1) {

        return res.status(401).send("Invalid login.");
    }

    const username = credentials.substring(
        0,
        separator
    );

    const password = credentials.substring(
        separator + 1
    );

    if (
        username !== ADMIN_USERNAME ||
        password !== ADMIN_PASSWORD
    ) {

        res.setHeader(
            "WWW-Authenticate",
            'Basic realm="My Store Admin"'
        );

        return res.status(401).send("Incorrect username or password.");
    }

    next();
}


// =========================
// TEST API
// =========================

app.get("/api/test", (req, res) => {

    res.json({
        message: "Store API is working!"
    });

});


// =========================
// CREATE ORDER
// =========================

app.post("/api/orders", (req, res) => {

    try {

        const order = req.body;

        const customer = order.customer;
        const shipping = order.shipping;
        const items = order.items;
        const paymentMethod = order.paymentMethod;


        // Basic validation

        if (
            !customer ||
            !customer.name ||
            !customer.email ||
            !items ||
            items.length === 0 ||
            !paymentMethod
        ) {

            return res.status(400).json({

                success: false,

                message: "Missing required order information."

            });

        }

// =========================
// VERIFY PRODUCTS AND PRICES
// =========================

const verifiedItems = [];

for (const item of items) {

    const product = products[item.name];

    if (!product) {

        return res.status(400).json({

            success: false,

            message: "Invalid product: " + item.name

        });

    }

    verifiedItems.push({

        name: item.name,

        price: product.price

    });

}

        // Save order

        const statement = db.prepare(`

            INSERT INTO orders (

                customer_name,
                customer_email,
                address,
                city,
                state,
                zip,
                items,
                payment_method

            )

            VALUES (?, ?, ?, ?, ?, ?, ?, ?)

        `);


        const result = statement.run(

            customer.name,

            customer.email,

            shipping?.address || "",

            shipping?.city || "",

            shipping?.state || "",

            shipping?.zip || "",

            JSON.stringify(verifiedItems),

            paymentMethod

        );


        console.log(
            "New order saved. Order ID:",
            result.lastInsertRowid
        );


        res.json({

            success: true,

            message: "Order saved successfully!",

            orderId: result.lastInsertRowid

        });

    }

    catch (error) {

        console.error(
            "Order error:",
            error
        );

        res.status(500).json({

            success: false,

            message: "Could not save order."

        });

    }

});

// =========================
// GET ALL ORDERS
// =========================

// =========================
// GET ALL ORDERS
// =========================

app.get("/api/orders", adminAuth, (req, res) => {

    try {

        const orders = db.prepare(`
            SELECT *
            FROM orders
            ORDER BY id DESC
        `).all();


        res.json({

            success: true,

            orders: orders

        });

    }

    catch (error) {

        console.error(
            "Could not load orders:",
            error
        );


        res.status(500).json({

            success: false,

            message: "Could not load orders."

        });

    }

});


// =========================
// UPDATE ORDER STATUS
// =========================

app.patch(
    "/api/orders/:id/status",
    adminAuth,
    (req, res) => {

    try {

        const orderId = req.params.id;

        const newStatus =
            req.body.status;


        const allowedStatuses = [

            "pending",
            "paid",
            "shipped",
            "completed",
            "cancelled"

        ];


        if (!allowedStatuses.includes(newStatus)) {

            return res.status(400).json({

                success: false,

                message: "Invalid order status."

            });

        }


        const statement = db.prepare(`
            UPDATE orders
            SET status = ?
            WHERE id = ?
        `);


        const result = statement.run(

            newStatus,

            orderId

        );


        if (result.changes === 0) {

            return res.status(404).json({

                success: false,

                message: "Order not found."

            });

        }


        console.log(
            `Order #${orderId} changed to ${newStatus}`
        );


        res.json({

            success: true,

            message: "Order status updated."

        });

    }

    catch (error) {

        console.error(
            "Status update error:",
            error
        );


        res.status(500).json({

            success: false,

            message: "Could not update order status."

        });

    }

});


// =========================
// START SERVER
// =========================

app.listen(PORT, () => {

    console.log(
        `Store running at http://localhost:${PORT}`
    );

});