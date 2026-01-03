"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchBookAuto = searchBookAuto;
exports.fetchBook = fetchBook;
exports.pickBook = pickBook;
exports.normalizeGoogleBook = normalizeGoogleBook;
const readline_1 = __importDefault(require("readline"));
const BASE_URL = "https://www.googleapis.com/books/v1/volumes";
// for goodreads csv (using ISBN so no choosing from options)
async function searchBookAuto(query) {
    const url = new URL(BASE_URL);
    url.searchParams.set("q", query);
    url.searchParams.set("maxResults", "1");
    url.searchParams.set("langRestrict", "en");
    const res = await fetch(url.toString());
    if (!res.ok) {
        throw new Error(`Google Books API error: ${res.status}`);
    }
    const data = await res.json();
    return data.items?.[0] ?? null;
}
// manual searching (choosing from 5 options)
async function fetchBook(query, maxResults = 5) {
    const url = new URL(BASE_URL);
    url.searchParams.set("q", query);
    url.searchParams.set("maxResults", String(maxResults));
    url.searchParams.set("langRestrict", "en");
    const res = await fetch(url.toString());
    if (!res.ok) {
        throw new Error(`Google Books API error: ${res.status}`);
    }
    const data = await res.json();
    return pickBook(data.items);
}
async function pickBook(items) {
    if (items.length === 0) {
        console.log("No books found :(");
        throw new Error("No books to pick from");
    }
    if (items.length === 1) {
        return items[0];
    }
    items.forEach((item, i) => {
        const info = item.volumeInfo;
        console.log(`${i + 1}. ${info.title} — ${info.authors?.join(", ") ?? "Unknown"} (${info.publishedDate ?? "?"})`);
    });
    const answer = await ask(`Choose a book (1-${items.length}): `);
    const index = Number(answer) - 1;
    if (Number.isNaN(index) || index < 0 || index >= items.length) {
        throw new Error("Invalid selection");
    }
    return items[index];
}
function ask(question) {
    const rl = readline_1.default.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}
function normalizeGoogleBook(item) {
    const info = item.volumeInfo;
    const isbn13 = info.industryIdentifiers?.find((id) => id.type === "ISBN_13")?.identifier;
    return {
        title: info.title,
        subtitle: info.subtitle,
        authors: info.authors ?? ["Unknown"],
        publishedYear: info.publishedDate
            ? Number(info.publishedDate.slice(0, 4))
            : undefined,
        pages: info.pageCount,
        isbn13,
        categories: info.categories ?? [],
        description: info.description,
        googleBooksId: item.id,
        imageLinks: info.imageLinks
    };
}
