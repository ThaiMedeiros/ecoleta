//no typescript as bibliotecas tem que ver com o código delas, e com sua definição de tipo
import express from "express";

const app = express();

//em uma aplicação typescript é necessário para executar o servidor um arquivo de configuração executado automaticamente com: npx tsc --init
//para o servidor ficar "escutando as alterações" instala-se o pacote: npm ts-node-dev -D
app.get("/users", (request, response) => {
  console.log("teste");
  response.send("Hello Word");
});

app.listen(3333);
