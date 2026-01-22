const express = require('express');
const mysql = require('mysql2/promise');
const cors = require("cors");
require('dotenv').config();

const port = process.env.PORT || 3000;

// Database config info
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 100,
    queueLimit: 0,
};

const app = express();

// CORS Configuration - FIXED
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://l15-onlinecardappwebservice.onrender.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (Postman/server-to-server/same-origin)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      console.log("Blocked origin:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
  })
);

// Parse JSON body
app.use(express.json());

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log("Allowed origins:", allowedOrigins);
});

// GET all cards
app.get('/allcards', async (req, res) => {
    try {
        let connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM defaultdb.cards');
        await connection.end();
        res.json(rows);
    } catch(err) {
        console.error("Error fetching cards:", err);
        res.status(500).json({message: 'Server error for allcards'});
    }
});

// POST add card
app.post('/addcard', async (req, res) => {
    const { card_name, card_pic } = req.body;
    try {
        let connection = await mysql.createConnection(dbConfig);
        await connection.execute('INSERT INTO cards (card_name, card_pic) VALUES (?, ?)', [card_name, card_pic]);
        await connection.end();
        res.status(201).json({message: 'Card '+card_name+' added Successfully'});
    } catch(err) {
        console.error("Error adding card:", err);
        res.status(500).json({message: 'Server error - could not add card '+card_name});
    }
});

// PUT update card
app.put('/updatecard/:id', async (req, res) => {
    const { id } = req.params;
    const { card_name, card_pic } = req.body;
    try {
        let connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'UPDATE cards SET card_name = ?, card_pic = ? WHERE id = ?',
            [card_name, card_pic, id]
        );
        await connection.end();
        res.json({message: 'Card updated successfully'});
    } catch(err) {
        console.error("Error updating card:", err);
        res.status(500).json({message: 'Server error - could not update card'});
    }
});

// DELETE card
app.delete('/deletecard/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let connection = await mysql.createConnection(dbConfig);
        await connection.execute('DELETE FROM cards WHERE id = ?', [id]);
        await connection.end();
        res.json({message: 'Card deleted successfully'});
    } catch(err) {
        console.error("Error deleting card:", err);
        res.status(500).json({message: 'Server error - could not delete card'});
    }
});