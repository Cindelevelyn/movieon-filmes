const express = require("express");
const expressHandlebars = require("express-handlebars");
// const sessions = require("express-session");
// const cookieParser = require("cookie-parser");
// const uuidv4 = require("uuid").v4;
const path = require("path");
// const db = require("./db");

// const mysql = require("mysql2/promise");

const PORT = process.env.PORT || 3000;

const app = express(); // Equivalente ao create server

app.engine("handlebars", expressHandlebars.engine());

app.set("view engine", "handlebars");

app.set("views", "./views");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// app.use(cookieParser());
// app.use(
//   sessions({
//     secret: "thisIsMySecretKey",
//     saveUninitialized: true,
//     resave: false,
//     name: "Cookie de Sessao",
//     cookie: { maxAge: 1000 * 60 * 3 }, // 3 minutos
//   })
// );

// app.use("*", async function (req, res, next) {
//   if (!req.session.usuario && req.cookies.token) {
//     const resultado = await db.query("SELECT * FROM usuarios WHERE token = ?", [
//       req.cookies.token,
//     ]);
//     if (resultado.length) {
//       req.session.usuario = resultado[0];
//     }
//   }
//   next();
// });

// async function getConnection() {
//   const connection = await mysql.createConnection({
//     host: "localhost",
//     user: "root",
//     password: "",
//     database: "",
//   });
//   return connection;
// }

// async function query(sql = "", values = []) {
//   const conn = await getConnection();
//   const result = await conn.query(sql, values);
//   conn.end();

//   return result[0];
// }

app.get("/", async (req, res) => {
  res.render("index", {
    class: "d-none",
    tituloPagina: "movieon",
  });
});

app.get("/entrar", async (req, res) => {
  res.render("entrar", {
    layout: "login",
    tituloPagina: "movieon | login",
  });
});

app.get("/cadastro", async (req, res) => {
  res.render("cadastro", {
    layout: "login",
    tituloPagina: "movieon | cadastro",
  });
});

app.get("/home", async (req, res) => {
  res.render("index", {
    layout: "user",
    class: "",
    user: "cindy",
    tituloPagina: "movieon | cadastro",
  });
});

app.get("/filme", async (req, res) => {
  let valor = 19.0;

  filme = {
    titulo: "A espera de um milagre",
    valor: valor.toFixed(2),
    sinopse:
      "Um carcereiro tem um relacionamento incomum e comovente com um preso que está no corredor na morte: Coffey, um negro enorme, condenado por ter matado brutalmente duas gêmeas de nove anos.",
  };

  res.render("filme", {
    user: "cindy",
    layout: "user",
    filme: filme,
    classfooter: "d-none",
    tituloPagina: "movieon | filme",
  });
});

app.get("/sucesso", async (req, res) => {
  res.render("sucesso", {
    layout: "user",
    class: "",
    user: "cindy",
    tituloPagina: "movieon | cadastro",
  });
});

app.get("/contato", async (req, res) => {
  res.render("contato", {
    class: "",
    tituloPagina: "movieon | contato",
  });
});

app.get("/sobre", async (req, res) => {
  res.render("sobre", {
    class: "",
    tituloPagina: "movieon | sobre",
  });
});

app.listen(PORT, function () {
  console.log(`App de Exemplo escutando na porta ${PORT}`);
});
