//no typescript as bibliotecas tem que ver com o código delas, e com sua definição de tipo
import express from "express";
import path from "path";
import cors from "cors";
import routes from "./routes";

const app = express();

app.use(cors());
app.use(express.json());

//em uma aplicação typescript é necessário para executar o servidor um arquivo de configuração executado automaticamente com: npx tsc --init
//para o servidor ficar "escutando as alterações" instala-se o pacote: npm ts-node-dev -D
app.use(routes);

app.use("/uploads", express.static(path.resolve(__dirname, "..", "uploads")));

app.listen(3333);
