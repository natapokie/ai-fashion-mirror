import express, { Express, Request, Response } from "express";

const app: Express = express();

// TODO: move to separate env file
const PORT = 8080;

app.get('/', (req, res) => {
    res.send('Hello from the backend (Typescript + Express)!');
});

app.listen(PORT, () => {
    console.log(`Server started on port: ${PORT}`);
})