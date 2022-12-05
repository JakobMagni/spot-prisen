const { Client } = require("pg");
const express = require("express");
const morgan = require("morgan"); // Some nice logging

/**
 * Følgende parametre bruges til at forbinde til databasen.
 * PORT er den port som webserveren her kører på.
 * DB_USER er brugernavnet til databasen.
 * DB_HOST er serveren som databasen kører på. Enten localhost eller en anden server.
 * DB_NAME er det navn som databasen har.
 * DB_PW er password til DB_USER.
 * DB_PORT er porten til databasen. Det plejer at være 5432, så den behøver man nok ikke ændre.
 */
const PORT = process.env.PORT || 8080;
const DB_USER = process.env.DB_USER || "hgcpzbsv";
const DB_HOST = process.env.DB_HOST || "ella.db.elephantsql.com";
const DB_NAME = process.env.DB_NAME || "hgcpzbsv";
const DB_PW = process.env.DB_PW || "dSZzrJ-Df_BqOzIreAe9g550FmOhGu0M";
const DB_PORT = process.env.DB_PORT || 5432;

/**
 * I stedet for at ændre på DB-værdierne i koden herover, er det bedre at gøre det som
 * en del af den måde man kører programmet på. Hver DB-værdi kan sættes i terminalen
 * inden man kører programmet. Det gør man sådan her:
 * 
 * $ export DB_NAME="kristians-database"
 * 
 * Nu er DB_NAME sat til "kristians-database" når programmet kører, uden at man har
 * ændret i JavaScript-koden. Dette skal gøres hver gang du åbner en ny terminal.
 * Det skal helst gøres både for DB_NAME, DB_PW, DB_USER og DB_HOST.
 * PORT og DB_PORT plejer man ikke at ændre.
 */
if (!process.env.DB_NAME || !process.env.DB_PW || !process.env.DB_USER) {
  console.warn("Husk at sætte databasenavn, password og user via env vars.");
  console.warn("Eksempel på at sætte databasenavn i terminalen:");
  console.warn(`export DB_NAME="kristians-database"`);
  console.warn("Lige nu er databasenavn sat til:", DB_NAME);
} else {
  console.log("Postgres database:", DB_NAME);
  console.log("Postgres user:", DB_USER);
}

/*
 * Herunder laves web-serveren. Den indeholder din html (fra public-folderen)
 * og API'en så der er forbindelse videre til databasen fra JavaScript. Det er "to i en".
 */
const app = express();
const client = new Client({
  user: DB_USER,
  host: DB_HOST,
  database: DB_NAME,
  password: DB_PW,
  port: DB_PORT
});
client.connect();

app.use(express.text());
app.use(express.static("public"))
app.use(morgan("combined"));

/*
 * Her defineres API'en.
 * API: Gennemsnitspris per time (2021) til landing-page
 */
app.post("/api/diagram1", async (req, res) => {
  try {
    // Lav query
    const query = `SELECT AVG ("spotpris_dkk_mwh"), EXTRACT(HOUR FROM tidspunkt_dk) AS HOUR FROM spotpris GROUP BY hour ORDER BY hour`;
    queryData = await client.query(query);
    // Giv svar tilbage til JavaScript
    res.json({
      "ok": true,
      "data": queryData.rows,
    })
  } catch (error) {
    // Hvis query fejler, fanges det her.
    // Send fejlbesked tilbage til JavaScript
    res.json({
      "ok": false,
      "message": error.message,
    })
  }
});



// El-afgifter 
app.post("/api/elafgift", async (req, res) => {
  try {
    // Lav query
    const query = `SELECT * FROM elafgift`;
    queryData = await client.query(query);
    // Giv svar tilbage til JavaScript
    res.json({
      "ok": true,
      "data": queryData.rows,
    })
  } catch (error) {
    // Hvis query fejler, fanges det her.
    // Send fejlbesked tilbage til JavaScript
    res.json({
      "ok": false,
      "message": error.message,
    })
  }
});






// Transmission, system-tarif og balancetarif for 2021 (sammenlagt)
app.post("/api/tarif_sum", async (req, res) => {
  try {
    // Lav query
    const query = `SELECT SUM(COALESCE(transmission,0) + COALESCE(system_tarif,0) + COALESCE(balance_tarif,0)) FROM tariffer WHERE periode = '2021-01-01'`;
    queryData = await client.query(query);
    // Giv svar tilbage til JavaScript
    res.json({
      "ok": true,
      "data": queryData.rows,
    })
  } catch (error) {
    // Hvis query fejler, fanges det her.
    // Send fejlbesked tilbage til JavaScript
    res.json({
      "ok": false,
      "message": error.message,
    })
  }
});






// Ugentlige gennemsnints max- og minpris 
app.post("/api/avg_weekly", async (req, res) => {
  try {
    // Lav query
    const query = `SELECT AVG(maximum/1000) AS max_avg, AVG(minimum/1000) AS min_avg, week_nr FROM max_min_pris GROUP BY week_nr ORDER BY week_nr`;
    queryData = await client.query(query);
    // Giv svar tilbage til JavaScript
    res.json({
      "ok": true,
      "data": queryData.rows,
    })
  } catch (error) {
    // Hvis query fejler, fanges det her.
    // Send fejlbesked tilbage til JavaScript
    res.json({
      "ok": false,
      "message": error.message,
    })
  }
});

// Hourly gennemsnitspris (2021)
app.post("/api/avg_timepris", async (req, res) => {
  try {
    // Lav query
    const query = `SELECT AVG (dk_sum_samlet_gennemsnit.dk_sum_samlet_gennemsnit), EXTRACT(HOUR FROM tidspunkt) AS HOUR FROM dk_sum_samlet_gennemsnit GROUP BY hour ORDER BY hour`;
    queryData = await client.query(query);
    // Giv svar tilbage til JavaScript
    res.json({
      "ok": true,
      "data": queryData.rows,
    })
  } catch (error) {
    // Hvis query fejler, fanges det her.
    // Send fejlbesked tilbage til JavaScript
    res.json({
      "ok": false,
      "message": error.message,
    })
  }
});






app.get("/api/hello", async (req, res) => {
  res.json({ "message": "Hello, World!" });
})

// Web-serveren startes.
app.listen(PORT, () => console.log(`Serveren kører på http://localhost:${PORT}`));