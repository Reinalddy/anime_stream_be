import express from "express";
import { fetchHtml, saveAnimeListToDb } from "./services/animeListScrape.js";

const app = express();

app.get("/", (req, res) => {
    // fetchHtml("https://otakudesu.best/anime-list/");
    const list = saveAnimeListToDb();

    
    res.json({
        message: "Hello World",
        data: list
    });
})

app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});