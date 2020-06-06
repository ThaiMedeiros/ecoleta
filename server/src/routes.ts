import express from "express";

//importando os controladores
import PointsController from "./controllers/PointsController";
import ItemsController from "./controllers/ItemsController";

const routes = express.Router();

//criando instâncias dos recursos (controllers)
const pointsController = new PointsController();
const itemsController = new ItemsController();

routes.get("/items", itemsController.index); //buscar todos os itens

//pontos de coleta
routes.post("/points", pointsController.create); //cadastrar
routes.get("/points", pointsController.index); //listar todos os pontos
routes.get("/points/:id", pointsController.show); //listar ponto específico

export default routes;
