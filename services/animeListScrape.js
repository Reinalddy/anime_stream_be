import axios from "axios";
import * as cheerio from "cheerio";
import { prisma } from "../config/prisma.js";
const BASE_URL = "https://ww3.anoboy.app";
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

    $('#ada #mylist .type-post').each((index, element) => {
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


export async function getDetailAnime(url) {
    // FUNCTION INI AKAN MENGAMBIL DATA :
    // 1. TITLE
    // 2. GENRE
    // 3. TOTAL EPISODE
    // 4. STATUS
    // 5. RELEASE DATE
    // 6. DESCRIPTION
    // 7. IMAGE

    const html = await fetchHtml(url);
    const $ = cheerio.load(html);

    const imageClass = ".column-three-fourth";
    const synopsisClass = ".column-three-fourth .unduhan";
    const totalEpisodeClass = ".unduhan";
    const studioClass = ".unduhan";
    const genreClass = ".unduhan";
    const ratingClass = ".unduhan";

    // Ambil element pertama yang ketemu
    const imageUrl = $(imageClass).find("amp-img").first().attr("src"); 
    const synopsis = $(synopsisClass).first().toString();
    const totalEpisodeRaw = $(totalEpisodeClass).find("td").eq(1).text().trim();
    const totalEpisode = totalEpisodeRaw.split("s/d").pop().trim();
    const studio = $(studioClass).find("td").eq(2).text().trim();
    const genre = $(genreClass).find("td").eq(5).text().trim();
    const rating = $(ratingClass).find("td").eq(6).text().trim();


    console.log(totalEpisode);
    
    return {
        image: imageUrl,
        synopsis: synopsis,
        total_episode: totalEpisode,
        studio: studio,
        genre: genre,
        rating: rating
    }
    
}

export async function saveDetailAnimeToDb() {
    // GET ALL ANIME TITLE FROM DB
    const list = await prisma.anime.findMany();
    let detail = null;
    for (const item of list) {
        detail = await getDetailAnime(item.anime_url);
        console.log(item.anime_url)
        await prisma.anime.update({
            where: { id: item.id },
            data: {
                image_url : detail.image,
                synopsis : detail.synopsis,
                total_episode : detail.total_episode,
                studio : detail.studio,
                genre : detail.genre,
                rating : detail.rating
            }
        });
    }

    return detail;
}