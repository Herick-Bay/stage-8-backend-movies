const { Router } = require("express");

const MoviesController = require("../controllers/MoviesControllers");
const moviesController = new MoviesController();

const moviesRoutes = Router();

moviesRoutes.get("/", moviesController.index);
moviesRoutes.post("/:user_id", moviesController.create);
moviesRoutes.get("/:id", moviesController.show)
moviesRoutes.delete("/:id", moviesController.delete)

module.exports = moviesRoutes;