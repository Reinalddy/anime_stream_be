import express from "express";
import { fetchHtml } from "./services/animeListScrape.js";

const app = express();

app.get("/", (req, res) => {
    fetchHtml("https://otakudesu.best/anime-list/");

    res.json({
        message: "Hello World"
    });
})

app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});