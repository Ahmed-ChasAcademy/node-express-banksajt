import express from "express";
import mysql from "mysql2/promise";
import cors from 'cors'

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


  app.post("/users", async(req,res)=> {

    const {username,password} = req.body;

    try {
      const result = await query(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        [username,password]
      )

      console.log(result);
      res.status(201).send("user created")
    }

    catch(error){
      console.log("Error creating users", error)
      res.status(500).send("error creating user");
    }

  })





app.listen(port, () => {
  console.log("Listening on port: " + port);
});

