import express from "express";
import { fetchHtml, saveAnimeListToDb, getDetailAnime, getAnimeOngoingEpisodeUrl, saveDetailAnimeToDb, getStatusAnime, updateStatusAnime } from "./services/animeScrape.js";

const app = express();

app.get("/", (req, res) => {
    const test2 = updateStatusAnime();
    res.json({
        message: "Hello World",
        data: test2
    });
})

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log("Server is running on http://localhost:" + port);
});