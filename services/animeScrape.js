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

export async function getAnimeEpsodeUrl(url) {
    const html = await fetchHtml(url);
    const $ = cheerio.load(html);

    const episodeList = [];
}

export async function getStatusAnime(title) {
    const html = await fetchHtml(BASE_URL + "/anime-list/");
    const $ = cheerio.load(html);

    const onGoingElements = $(".OnGoing");

    for (const element of onGoingElements) {
        const title = $(element).text().trim();
        const url = $(element).find("a").attr("href");
        console.log(title);

        const animeListFromDb = await prisma.anime.findFirst({
            where: { title }
        });

        if (animeListFromDb) {
            await prisma.anime.update({
                where: { id: animeListFromDb.id },
                data: { status: "on_going" }
            });
        }
    }
}

export async function updateStatusAnime() {
    const anime = await prisma.anime.findMany({
        where: {
            status: null
        }
    })

    for (const item of anime) {
        console.log(item);
        await prisma.anime.update({
            where: { id: item.id },
            data: { status: "completed" }
        });
    }
}

export async function getAnimeOngoingEpisodeUrl() {

    try {
        const anime = await prisma.anime.findMany({
            where: {
                status: "on_going"
            }
        });
    
        for (const item of anime) {
            let html = await fetchHtml(item.anime_url);
            const $ = cheerio.load(html);

            // CARI URL ANIME PER EPISODE
            const animeClassId = ".singlelink .lcp_catlist li a";

            // LOOPING SEMUA ELEMENT A
            for (const element of $(animeClassId)) {
                const url = $(element).attr("href");
                const episodeNum = $(element).text();
                // CREATE RECORD ANIME EPISODE
                await prisma.episode.create({
                    data: {
                        animeId: item.id,
                        episode_url: url,
                        anime: item.title,
                        episode_num: $(element).text()
                    }
                });
                console.log(episodeNum);
            }
    
        }
        
        console.log("update anime episode url done");

        return anime;
    } catch (error) {
        console.log(error);
        return null;
        
    }
}