import axios from "axios";
import * as cheerio from "cheerio";
// import { cheerio } from "cheerio";

export async function fetchHtml(url) {
    try {
        const res = await axios.get(url, {
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
            },
            timeout: 15000, // biar gak ngegantung kalau server lemot
        });

        return res.data;

        // GET ALL TITLE ANIME
    
        // console.log(res.data);
        // const $ = cheerio.load(res.data);
        // const animeList = [];

        // // Ambil tiap list anime (.daftarkartun #abtext .bariskelom ul li)
        // $('.daftarkartun #abtext .bariskelom ul li').each((index, element) => {
        //     console.log($(element).text());
        // })
    } catch (error) {
        console.error("Fetch error:", error.message);
        return null;
    }
}