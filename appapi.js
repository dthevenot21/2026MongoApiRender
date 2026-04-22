//async et await permettent de gérer des actions qui prennent du temps (comme une requête à une base de données) sans bloquer le programme.
//asynchrone
//await : attend que opération soit terminée pour continuer, doit être dans fonction asynchrone
//sinon "then" possible

require("dotenv").config();//pour utilisation fichier .env

const express = require("express");
const { MongoClient } = require("mongodb");
 
const app = express();
//const client = new MongoClient("mongodb://localhost:27017");//serveur de bdd local

//const client = new MongoClient("mongodb+srv://DTadmin:DTadmin@cluster0.wplrati.mongodb.net/dbmovies");//dans cloud

const client = new MongoClient(process.env.MONGO_URI); //avec variables d'environnement

//console du navigateur F12 : blocked by CORS policy + No 'Access-Control-Allow-Origin'
//“Le navigateur bloque la requête car le serveur n’autorise pas les accès externes.”
//installer cors côté serveur node.js : npm install cors
//CORS est une sécurité du navigateur qui empêche un site web d’appeler un autre serveur sans autorisation.”


const cors = require("cors");
app.use(cors());

//connexion 1 fois
async function start() {
  //await client.connect();
  console.log("Connecté à MongoDB");

  app.listen(process.env.PORT || 3000, () => {
    console.log("Serveur lancé");
  });
}

start();

//GET-OK
//liste des films
app.get("/movies", async (req, res) => {
  //await client.connect();
  try {
    const db = client.db("dbmovies");
    const movies = await db.collection("movies").find().toArray();
    console.log("Liste des films" );//s'affiche sur le terminal du serveur
    res.json(movies);
  }
  catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//liste des films d'une année 
app.get("/movies/year/:year", async (req, res) => {
  const year = parseInt(req.params.year);

  const db = client.db("dbmovies");
  const movies = await db.collection("movies")
    .find({ year: year })
    .toArray();
  console.log("Films de " + year );//s'affiche sur le terminal du serveur
  
  res.json(movies);
});

//DELETE-OK
app.delete("/movies/:title", async (req, res) => {
  const title = req.params.title;

  const db = client.db("dbmovies");

  const result = await db.collection("movies").deleteOne({ title: title });

  res.json({
    message: "Film supprimé",
    deletedCount: result.deletedCount
  });
});

//POST-OK
app.use(express.json()); // obligatoire

app.post("/movies", async (req, res) => {
 
  const movie = req.body;

  const db = client.db("dbmovies");

  const result = await db.collection("movies").insertOne(movie);

  res.json({
    message: "Film ajouté",
    id: result.insertedId
  });
});


//PUT-OK
//app.use(express.json());

app.put("/movies/:title", async (req, res) => {
  const title = req.params.title;
  const updateData = req.body;

  const db = client.db("dbmovies");

  const result = await db.collection("movies").updateOne(
    { title: title },
    { $set: updateData }
  );

  res.json({
    message: `Film ${title} mis à jour`,
    modifiedCount: result.modifiedCount
  });
});

/*app.listen(3000, () => {
  console.log("Serveur lancé sur http://localhost:3000");
});*/

//port dynamique pour Render
app.listen(process.env.PORT || 3000, () => {
  console.log("Serveur lancé sur le port", process.env.PORT || 3000);
});

console.log("Connexion à :", process.env.MONGO_URI);