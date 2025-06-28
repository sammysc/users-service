const express = require("express");
const router = express.Router();
const  {Teacher}  = require("../models");
const { Op } = require("sequelize");
const axios = require("axios");

// GET /teachers - Lista de Professores com paginação
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: teachers } = await Teacher.findAndCountAll({
      limit,
      offset,
      order: [["name", "ASC"]],
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      teachers,
      pagination: {
        totalItems: count,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar professores" });
  }
});

// GET /teachers/:id - Busca um professor específico
router.get("/:id", async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);
    if (teacher) {
      res.json(teacher);
    } else {
      res.status(404).json({ error: "Professor não encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar professor" });
  }
});

// POST /teachers - Criação de professores
router.post("/", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // Cria o professor localmente
    const teacher = await Teacher.create({ name, email, password });

    // Registra o usuário no serviço de autenticação
    await axios.post("http://auth-service:3002/auth/register", {
      email,
      password,
      userType: "teacher",
      name
    });

    res.status(201).json(teacher);
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
    res.status(500).json({ error: "Erro ao criar professor" });
  }
});

// PUT /teachers/:id - Edição de professores
router.put("/:id", async (req, res) => {
  try {
    const { name, email } = req.body;
    const teacher = await Teacher.findByPk(req.params.id);

    if (teacher) {
      await teacher.update({ name, email });
      res.json(teacher);
    } else {
      res.status(404).json({ error: "Professor não encontrado" });
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
    res.status(500).json({ error: "Erro ao atualizar professor" });
  }
});

// DELETE /teachers/:id - Exclusão de professores
router.delete("/:id", async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);

    if (teacher) {
      await teacher.destroy();
      res.status(204).send();
    } else {
      res.status(404).json({ error: "Professor não encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: "Erro ao excluir professor" });
  }
});

// GET /teachers/search - Busca de professores
router.get("/search/query", async (req, res) => {
  try {
    const { q } = req.query;
    const teachers = await Teacher.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${q}%` } },
          { email: { [Op.like]: `%${q}%` } },
        ],
      },
    });
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar professores" });
  }
});

module.exports = router;
