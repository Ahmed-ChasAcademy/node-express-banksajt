import express from "express";
import mysql from "mysql2/promise";
import cors from 'cors'

const crypto = require("crypto");

const app = express();
const port = 3000;

// middleware
app.use(express.json());
app.use(cors());

// Databas uppkoppling
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "banksajt",
  port: 3306, // Obs! 3306 för windowsanvändare
});

type User = {
  id: number;
  username: string;
  password: string;
}

// Funktion för att göra förfrågan till databas
async function query(sql: string, params: any[]) {
  const [results] = await pool.execute(sql, params);
  return results as User[];
}

//create user
app.post("/users", async (req, res) => {

  const { username, password } = req.body;

  try {
    const result = await query(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [username, password]
    )

    console.log(result);
    res.status(201).send("user created")
  }

  catch (error) {
    console.log("Error creating users", error)
    res.status(500).send("error creating user");
  }

})

// Login
app.post("/sessions", async (req, res)=>{

  const { username, password } = req.body;

  try {
    const result = await query("SELECT * FROM users WHERE username = ?", [username])
    const user = result[0]

    if(user.password === password){
      
      const token = crypto.randomBytes(32).toString("hex");
      
      await query("INSERT INTO sessions (userid, token) VALUES (?, ?)", [user.id, token])
            
      res.status(200).send({"token": token})
    } else {
      res.status(401).send("invalid username or password")
    }
  }

  catch (error) {
    console.log("Error logging in", error)
  }

})

app.listen(port, () => {
  console.log("Listening on port: " + port);
});



