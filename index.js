const express = require("express");
const expressHandlebars = require("express-handlebars");
const sessions = require("express-session");
const cookieParser = require("cookie-parser");
// const uuidv4 = require("uuid").v4;
const path = require("path");

const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

const mysql = require("mysql2/promise");

const PORT = process.env.PORT || 3000;

const app = express(); // Equivalente ao create server

app.engine("handlebars", expressHandlebars.engine());

app.set("view engine", "handlebars");

app.set("views", "./views");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  sessions({
    secret: "thisIsMySecretKey",
    saveUninitialized: true,
    resave: false,
    name: "Cookie de Sessao",
    cookie: { maxAge: 1000 * 60 * 3 }, // 3 minutos
  })
);

async function getConnection() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "b@ngtH0226",
    database: "movieon",
  });
  return connection;
}

async function query(sql = "", values = []) {
  const conn = await getConnection();
  const result = await conn.query(sql, values);
  conn.end();

  return result[0];
}

app.use("*", async function (req, res, next) {
  if (!req.session.usuario && req.cookies.token) {
    const resultado = await query("SELECT * FROM usuarios WHERE token = ?", [
      req.cookies.token,
    ]);
    if (resultado.length) {
      req.session.usuario = resultado[0];
    }
  }
  next();
});

app.get("/", async (req, res) => {
  if (req.session.usuario) {
    res.redirect("/home");
    return;
  }

  let filmes = await query("SELECT * FROM filme");
  console.log(filmes);

  res.render("index", {
    class: "d-none",
    classADMIN: "d-none",
    tituloPagina: "movieon",
    listaFilme: filmes,
  });
});

app.get("/logout", function (req, res) {
  res.cookie("token", "");
  req.session.destroy();
  res.redirect("/entrar");
});

app.get("/entrar", async (req, res) => {
  res.render("entrar", {
    layout: "login",
    tituloPagina: "movieon | login",
  });
});

app.post("/entrar", async (req, res) => {
  const { user: usuario, pwd } = req.body;
  const resultado = await query(
    "SELECT * FROM usuarios WHERE email = ? AND senha = ?",
    [usuario, pwd]
  );
  console.log(resultado);

  if (resultado.length > 0) {
    req.session.usuario = resultado[0];
    if (resultado[0].token == "admin") {
      res.redirect("/admin");
    } else {
      res.redirect("/home");
    }
    return;
  } else {
    res.render("entrar", {
      layout: "login",
      tituloPagina: "movieon | login",
      mensagemErro: "Usuário/Senha não compatíveis ou existentes.",
    });
  }
});

app.get("/cadastro", async (req, res) => {
  res.render("cadastro", {
    layout: "login",
    tituloPagina: "movieon | cadastro",
  });
});

app.post("/cadastro", async (req, res) => {
  const nome = req.body.nome;
  const email = req.body.email;
  const pwd = req.body.pwd;

  let resultado = await query("SELECT * FROM usuarios WHERE email = ?", [
    email,
  ]);

  console.log(nome);
  console.log(email);
  console.log(pwd);

  console.log(resultado);
  console.log(resultado.length);

  if (resultado.length > 0) {
    res.render("cadastro", {
      tituloPagina: "Cadastro",
      titulo: "Cadastro",
      frase:
        "Utilize o formulário abaixo acima para realizar o cadastro na aplicação.",
      mensagemErro: "Usuário/Senha já existentes!",
    });
  } else {
    resultado = await query(
      "INSERT INTO usuarios(nome, email, senha) VALUES(?, ?, ?)",
      [nome, email, pwd]
    );

    res.redirect("/entrar");
    return;
  }
});

app.get("/admin", async (req, res) => {
  if (!req.session.usuario) {
    res.redirect("/");
    return;
  }
  let filmes = await query("SELECT * FROM filme");

  res.render("index", {
    layout: "admin",
    user: req.session.usuario,
    tituloPagina: "movieon | ADMIN",
    listaFilme: filmes,
  });
});

app.get("/cadastro-filme", async (req, res) => {
  res.render("cadastro-filme", {
    layout: "admin",
    classfooter: "d-none",
    tituloPagina: "movieon | Novo Filme",
  });
});

app.post("/cadastro-filme", async (req, res) => {
  const img = req.body.foto;
  const titulo = req.body.titulo;
  const duracao = req.body.duracao;
  const horario1 = req.body.horario1;
  const horario2 = req.body.horario2;
  const valor = req.body.valor;
  const sinopse = req.body.sinopse;

  const qtdCadeira = 30;

  const filmeExiste = await query(
    "SELECT nome FROM filme WHERE nome = ?",
    titulo
  );

  if (filmeExiste.length > 0) {
    res.render("cadastro-filme", {
      tituloPagina: "Cadastro de Filme",
      titulo: "Cadastro de Filme",
      mensagemErro: "O filme já existe!",
    });
  } else {
    let filme =
      "INSERT INTO filme(nome, duracao, fotoURL, sinopse) VALUES (?,?,?,?)";
    await query(filme, [titulo, duracao, img, sinopse]);

    console.log(titulo);

    const id_filme = "SELECT id_filme FROM filme WHERE nome = ?";
    id = await query(id_filme, titulo);

    id = Object.values(id[0]);

    let sessao =
      "INSERT INTO sessao(id_filme, hora, qtdCadeira, valor) VALUES (?,?,?,?)";
    await query(sessao, [id, horario1, qtdCadeira, valor]);
    await query(sessao, [id, horario2, qtdCadeira, valor]);

    res.redirect("/home");
    return;
  }
});

app.get("/home", async (req, res) => {
  if (!req.session.usuario) {
    res.redirect("/");
    return;
  }

  if (req.session.usuario.token == "admin") {
    res.redirect("/admin");
    return;
  }

  let filmes = await query("SELECT * FROM filme");

  res.render("index", {
    layout: "user",
    class: "",
    classADMIN: "d-none",
    usuario: req.session.usuario,
    tituloPagina: "movieon | cadastro",
    listaFilme: filmes,
  });
});

app.get("/filme/:id", async (req, res) => {
  if (!req.session.usuario) {
    res.redirect("/entrar");
    return;
  }

  const id = parseInt(req.params.id);
  let consulta =
    "SELECT filme.*, sessao.valor, sessao.qtdCadeira, sessao.hora FROM filme LEFT JOIN sessao ON sessao.id_filme = filme.id_filme WHERE filme.id_filme = ?";

  let dados = await query(consulta, [id]);

  let consulta2 = await query("SELECT * from sessao");
  console.log(consulta2);

  console.log(dados[0].valor);

  let valor = parseFloat(dados[0].valor).toFixed(2);

  filme = {
    fotoURL: dados[0].fotoURL,
    titulo: dados[0].nome.toUpperCase(),
    valor: valor,
    sinopse: dados[0].sinopse,
    hora: dados[0].hora,
    hora2: dados[1].hora,
  };

  res.render("filme", {
    user: req.session.usuario,
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
