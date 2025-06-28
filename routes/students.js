const express = require("express");
const router = express.Router();
const {Student}= require("../models");
const { Op } = require("sequelize");
const axios = require("axios");


// GET /students - Lista de Alunos com paginação
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: students } = await Student.findAndCountAll({
      limit,
      offset,
      order: [["name", "ASC"]],
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      students,
      pagination: {
        totalItems: count,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar alunos" });
  }
});

// GET /students/:id - Busca um aluno específico
router.get("/:id", async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (student) {
      res.json(student);
    } else {
      res.status(404).json({ error: "Aluno não encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar aluno" });
  }
});

// POST /students - Criação de alunos
router.post("/", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // Cria o aluno localmente
    const student = await Student.create({ name, email, password });

    // Registra o usuário no serviço de autenticação
    await axios.post("http://auth-service:3002/auth/register", {
      email,
      password,
      userType: "student",
      name,
    });

    res.status(201).json(student);
  } catch (error) {
     console.error(error);
    if (
      error.name === "SequelizeValidationError" ||
      error.name === "SequelizeUniqueConstraintError"
    ) {
      return res
        .status(400)
        .json({ error: error.errors.map((e) => e.message) });
    }
    res.status(500).json({ error: "Erro ao cadastrar aluno" });
  }
});

// PUT /students/:id - Edição de alunos
router.put("/:id", async (req, res) => {
  try {
    const { name, email } = req.body;
    const student = await Student.findByPk(req.params.id);

    if (student) {
      await student.update({ name, email });
      res.json(student);
    } else {
      res.status(404).json({ error: "Aluno não encontrado" });
    }
  } catch (error) {
    if (
      error.name === "SequelizeValidationError" ||
      error.name === "SequelizeUniqueConstraintError"
    ) {
      return res
        .status(400)
        .json({ error: error.errors.map((e) => e.message) });
    }
    res.status(500).json({ error: "Erro ao atualizar aluno" });
  }
});

// DELETE /students/:id - Exclusão de alunos
router.delete("/:id", async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);

    if (student) {
      await student.destroy();
      res.status(204).send();
    } else {
      res.status(404).json({ error: "Aluno não encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: "Erro ao excluir aluno" });
  }
});

// GET /students/search - Busca de alunos
router.get("/search/query", async (req, res) => {
  try {
    const { q } = req.query;
    const students = await Student.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${q}%` } },
          { email: { [Op.like]: `%${q}%` } },
        ],
      },
    });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar alunos" });
  }
});

module.exports = router;
