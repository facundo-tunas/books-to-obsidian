"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const sync_1 = require("csv-parse/sync");
const googleBooks_1 = require("./googleBooks");
const obsidian_1 = require("./obsidian");
const CSV_PATH = process.env.CSV_PATH || "";
function cleanISBN(isbn) {
    if (!isbn)
        return null;
    return isbn.replace(/[^0-9X]/gi, "") || null;
}
(async () => {
    if (!fs_1.default.existsSync(CSV_PATH)) {
        throw new Error("csv not found");
    }
    const raw = fs_1.default.readFileSync(CSV_PATH, "utf8");
    const records = (0, sync_1.parse)(raw, {
        columns: true,
        skip_empty_lines: true,
    });
    console.log(`Found ${records.length} books`);
    let imported = 0;
    let skipped = 0;
    for (const row of records) {
        try {
            const isbn13 = cleanISBN(row.ISBN13);
            const query = isbn13 ? `isbn:${isbn13}` : `${row.Title} ${row.Author}`;
            const result = await (0, googleBooks_1.searchBookAuto)(query);
            if (!result) {
                console.warn(`No match: ${row.Title}`);
                skipped++;
                continue;
            }
            const book = (0, googleBooks_1.normalizeGoogleBook)(result);
            book.rating = parseRating(row["My Rating"]);
            book.dateRead = parseDate(row["Date Read"]);
            book.status = parseStatus(row["Exclusive Shelf"]);
            if ((0, obsidian_1.bookExists)(book)) {
                skipped++;
                continue;
            }
            (0, obsidian_1.writeBook)(book, (0, obsidian_1.bookToMarkdown)(book));
            imported++;
            console.log(`🐐 ${book.title}`);
        }
        catch (err) {
            console.error(`🪦 Failed: ${row.Title}`);
            console.error(err instanceof Error ? err.message : err);
            skipped++;
        }
    }
    console.log(`\nDone`);
    console.log(`Imported: ${imported}`);
    console.log(`Skipped: ${skipped}`);
})();
function parseRating(value) {
    const n = Number(value);
    return n > 0 ? n : undefined;
}
function parseDate(value) {
    if (!value)
        return undefined;
    return value.replace(/\//g, "-");
}
function parseStatus(value) {
    if (value === "read")
        return true;
    if (value === "to-read")
        return false;
    if (value === "currently-reading")
        return false;
    return false;
}
