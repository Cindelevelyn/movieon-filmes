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
//     password: "b@ngtH0226",
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

app.listen(PORT, function () {
  console.log(`App de Exemplo escutando na porta ${PORT}`);
});