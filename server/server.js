const express = require("express");
const path = require("path");
const Database = require("better-sqlite3");

require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;


// =========================
// SHIPPING
// =========================

const SHIPPING_PER_ITEM = 2.99;


// =========================
// PRODUCT CATALOG
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


const products = {

    "Rust Semi Automatic Rifle": {

        price: 24.99,

        colors: defaultColors

    },


    "Rust Revolver": {

        price: 29.99,

        colors: defaultColors

    },


    "Rust C4 Replica": {

        price: 19.99,

        colors: defaultColors

    }

};


// =========================
// DATABASE
// =========================

const dbPath =
    process.env.DB_PATH ||
    path.join(__dirname, "store.db");

const db =
    new Database(dbPath);


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
// ADD SHIPPING COLUMN
// =========================

// This keeps old orders and upgrades the
// existing database automatically.

const orderColumns =
    db.prepare(`
        PRAGMA table_info(orders)
    `).all();


const hasShippingCost =
    orderColumns.some(
        column =>
            column.name === "shipping_cost"
    );


if (!hasShippingCost) {

    db.exec(`

        ALTER TABLE orders
        ADD COLUMN shipping_cost REAL NOT NULL DEFAULT 0

    `);

}


// =========================
// EXPRESS
// =========================

app.use(express.json());


// =========================
// ADMIN PAGE
// =========================

app.get(
    "/admin.html",
    adminAuth,
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "..",
                "admin.html"
            )
        );

    }
);


// Block public access to server folder

app.use(
    "/server",
    (req, res) => {

        res
            .status(404)
            .send("Not found");

    }
);


// Serve website files

app.use(
    express.static(
        path.join(__dirname, "..")
    )
);


// =========================
// ADMIN AUTH
// =========================

function adminAuth(
    req,
    res,
    next
) {

    const auth =
        req.headers.authorization;


    if (
        !auth ||
        !auth.startsWith("Basic ")
    ) {

        res.setHeader(
            "WWW-Authenticate",
            'Basic realm="My Store Admin"'
        );

        return res
            .status(401)
            .send(
                "Admin login required."
            );

    }


    const encoded =
        auth.split(" ")[1];


    let credentials;


    try {

        credentials =
            Buffer
                .from(
                    encoded,
                    "base64"
                )
                .toString("utf8");

    }

    catch {

        return res
            .status(401)
            .send("Invalid login.");

    }


    const separator =
        credentials.indexOf(":");


    if (separator === -1) {

        return res
            .status(401)
            .send("Invalid login.");

    }


    const username =
        credentials.substring(
            0,
            separator
        );


    const password =
        credentials.substring(
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

        return res
            .status(401)
            .send(
                "Incorrect username or password."
            );

    }


    next();

}


// =========================
// TEST API
// =========================

app.get(
    "/api/test",
    (req, res) => {

        res.json({

            message:
                "Store API is working!"

        });

    }
);


// =========================
// CREATE ORDER
// =========================

app.post(
    "/api/orders",
    (req, res) => {

        try {

            const order =
                req.body;


            const customer =
                order.customer;


            const shipping =
                order.shipping;


            const items =
                order.items;


            const paymentMethod =
                order.paymentMethod;


            // =========================
            // BASIC VALIDATION
            // =========================

            if (
                !customer ||
                !customer.name ||
                !customer.email ||
                !items ||
                !Array.isArray(items) ||
                items.length === 0 ||
                !paymentMethod
            ) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            "Missing required order information."

                    });

            }


            // =========================
            // PAYMENT VALIDATION
            // =========================

            const allowedPaymentMethods = [
                "zelle",
                "cashapp"
            ];


            if (
                !allowedPaymentMethods.includes(
                    paymentMethod
                )
            ) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            "Invalid payment method."

                    });

            }


            // =========================
            // VERIFY PRODUCTS
            // =========================

            const verifiedItems = [];


            for (const item of items) {

                const product =
                    products[item.name];


                if (!product) {

                    return res
                        .status(400)
                        .json({

                            success: false,

                            message:
                                "Invalid product: " +
                                item.name

                        });

                }


                // Verify color

                if (
                    !item.color ||
                    !product.colors.includes(
                        item.color
                    )
                ) {

                    return res
                        .status(400)
                        .json({

                            success: false,

                            message:
                                "Invalid product color."

                        });

                }


                // Use SERVER price

                verifiedItems.push({

                    name: item.name,

                    price: product.price,

                    color: item.color

                });

            }


            // =========================
            // CALCULATE SHIPPING
            // =========================

            const shippingCost =
                Number(
                    (
                        verifiedItems.length *
                        SHIPPING_PER_ITEM
                    ).toFixed(2)
                );


            // =========================
            // SAVE ORDER
            // =========================

            const statement =
                db.prepare(`

                    INSERT INTO orders (

                        customer_name,
                        customer_email,
                        address,
                        city,
                        state,
                        zip,
                        items,
                        payment_method,
                        shipping_cost

                    )

                    VALUES (
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?
                    )

                `);


            const result =
                statement.run(

                    customer.name,

                    customer.email,

                    shipping?.address || "",

                    shipping?.city || "",

                    shipping?.state || "",

                    shipping?.zip || "",

                    JSON.stringify(
                        verifiedItems
                    ),

                    paymentMethod,

                    shippingCost

                );


            console.log(
                "New order saved. Order ID:",
                result.lastInsertRowid,
                "Shipping:",
                shippingCost
            );


            res.json({

                success: true,

                message:
                    "Order saved successfully!",

                orderId:
                    result.lastInsertRowid,

                shippingCost:
                    shippingCost

            });

        }

        catch (error) {

            console.error(
                "Order error:",
                error
            );


            res
                .status(500)
                .json({

                    success: false,

                    message:
                        "Could not save order."

                });

        }

    }
);


// =========================
// GET ALL ORDERS
// =========================

app.get(
    "/api/orders",
    adminAuth,
    (req, res) => {

        try {

            const orders =
                db.prepare(`

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


            res
                .status(500)
                .json({

                    success: false,

                    message:
                        "Could not load orders."

                });

        }

    }
);


// =========================
// UPDATE ORDER STATUS
// =========================

app.patch(
    "/api/orders/:id/status",
    adminAuth,
    (req, res) => {

        try {

            const orderId =
                req.params.id;


            const newStatus =
                req.body.status;


            const allowedStatuses = [

                "pending",
                "paid",
                "shipped",
                "completed",
                "cancelled"

            ];


            if (
                !allowedStatuses.includes(
                    newStatus
                )
            ) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            "Invalid order status."

                    });

            }


            const statement =
                db.prepare(`

                    UPDATE orders
                    SET status = ?
                    WHERE id = ?

                `);


            const result =
                statement.run(

                    newStatus,

                    orderId

                );


            if (
                result.changes === 0
            ) {

                return res
                    .status(404)
                    .json({

                        success: false,

                        message:
                            "Order not found."

                    });

            }


            console.log(
                `Order #${orderId} changed to ${newStatus}`
            );


            res.json({

                success: true,

                message:
                    "Order status updated."

            });

        }

        catch (error) {

            console.error(
                "Status update error:",
                error
            );


            res
                .status(500)
                .json({

                    success: false,

                    message:
                        "Could not update order status."

                });

        }

    }
);


// =========================
// START SERVER
// =========================

app.listen(
    PORT,
    () => {

        console.log(
            `Store running at http://localhost:${PORT}`
        );

    }
);