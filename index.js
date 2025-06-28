const express = require("express");
const cors = require("cors");

const app = express();
const port = 3003;

const teachersRouter = require("./routes/teachers");
const studentsRouter = require("./routes/students");

//const { swaggerUi, specs } = require("./Swagger/swagger");

app.use(
  cors({
    origin: "http://localhost:3003",
    credentials: true,
  })
);

app.use(express.json());

app.use("/teachers", teachersRouter);
app.use("/students", studentsRouter);


// Configurar o Swagger
//app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.get("/", (req, res) => {
  res.send("Bem-vindo à Plataforma Educacional Tech Challenge Fiap!");
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
