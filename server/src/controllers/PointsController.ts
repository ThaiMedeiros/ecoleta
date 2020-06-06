import { Request, Response } from "express";
import knex from "../database/connection";

class PointsController {
  //listar todos os pontos de coleta
  async index(request: Request, response: Response) {
    const { city, uf, items } = request.query;

    //convertendo os itens em array
    const parsedItems = String(items)
      .split(",")
      .map((item) => Number(item.trim()));

    //pegar todos os dados dos pontos (de forma distinta) que contemplem os filtros passados
    const points = await knex("points")
      .join("point_items", "points.id", "=", "point_items.point_id")
      .whereIn("point_items.item_id", parsedItems)
      .where("city", String(city))
      .where("uf", String(uf))
      .distinct()
      .select("points.*");

    return response.json(points);
  }

  //listar um único ponto de coleta
  async show(request: Request, response: Response) {
    const { id } = request.params;

    const point = await knex("points").where("id", id).first();

    if (!point) {
      return response.status(400).json({ message: "Point not found." });
    }

    //pegar todos os itens relacionados a este ponto
    const items = await knex("items")
      .join("point_items", "items.id", "=", "point_items.item_id")
      .where("point_items.point_id", id)
      .select("items.title");

    return response.json({ point, items });
  }

  //cadastrar pontos de coleta
  async create(request: Request, response: Response) {
    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items,
    } = request.body;

    //dependência de query's (caso uma falhe a outra não executa)
    const trx = await knex.transaction();

    const point = {
      image:
        "https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60",
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
    };

    const insertedIds = await trx("points").insert(point);

    //ponto que acabou de ser inserido
    const point_id = insertedIds[0];

    //pegando cada item que foi inserido e relacionando com o ponto
    const pointItems = items.map((item_id: number) => {
      return { item_id, point_id };
    });

    await trx("point_items").insert(pointItems);

    //se ocorreu tudo certo, cadastrar na base de dados
    await trx.commit();

    return response.json({
      id: point_id,
      ...point,
    });
  }
}

export default PointsController;
