import axios from "axios";
import * as cheerio from "cheerio";
import { prisma } from "../config/prisma.js";
const BASE_URL = "https://otakudesu.best";
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

    } catch (error) {
        console.error("Fetch error:", error.message);
        return null;
    }
}

export async function getAnimeList() {

    const html = await fetchHtml(BASE_URL + "/anime-list/");
    const $ = cheerio.load(html);

    const list = [];

    $('.daftarkartun #abtext .bariskelom ul li').each((index, element) => {
        const title = $(element).text();
        const url =  $(element).find('a').attr('href');
        list.push({ title, url });
    });

    return list;
}

export async function saveAnimeListToDb() {
    const list = await getAnimeList();
    try {

        for (const item of list) {
            console.log(item);
            await prisma.anime.create({
                data: {
                    title: item.title,
                    anime_url: item.url
                }
            });
        }

        return list;
        
    } catch (error) {
        return null;
    }
}