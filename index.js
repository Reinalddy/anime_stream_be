import express from "express";
import { fetchHtml, saveAnimeListToDb, getDetailAnime, saveDetailAnimeToDb } from "./services/animeListScrape.js";

const app = express();

app.get("/", (req, res) => {
    // fetchHtml("https://otakudesu.best/anime-list/");
    // const list = saveAnimeListToDb();
    // const generateSlug = saveAnimeListToDb();
    // const test = getDetailAnime("https://ww3.anoboy.app/2023/04/oshi-no-ko-season-1-2/");
    const test2 = saveDetailAnimeToDb();
    res.json({
        message: "Hello World",
        data: test2
    });
})

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log("Server is running on http://localhost:" + port);
});