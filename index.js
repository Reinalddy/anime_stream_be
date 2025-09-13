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

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log("Server is running on http://localhost:" + port);
});