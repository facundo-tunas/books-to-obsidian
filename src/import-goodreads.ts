import fs from "fs";
import { parse } from "csv-parse/sync";

import { normalizeGoogleBook, searchBookAuto } from "./googleBooks";
import { bookExists, bookToMarkdown, writeBook } from "./obsidian";
import { Book } from "./types";

const CSV_PATH = process.env.CSV_PATH || "";

type GoodreadsRow = {
  Title: string;
  Author: string;
  ISBN13?: string;
  "My Rating"?: string;
  "Date Read"?: string;
  "Exclusive Shelf"?: string;
};

function cleanISBN(isbn?: string): string | null {
  if (!isbn) return null;
  return isbn.replace(/[^0-9X]/gi, "") || null;
}

(async () => {
  if (!fs.existsSync(CSV_PATH)) {
    throw new Error("csv not found");
  }

  const raw = fs.readFileSync(CSV_PATH, "utf8");

  const records = parse(raw, {
    columns: true,
    skip_empty_lines: true,
  }) as GoodreadsRow[];

  console.log(`Found ${records.length} books`);

  let imported = 0;
  let skipped = 0;

  for (const row of records) {
    try {
      const isbn13 = cleanISBN(row.ISBN13);
      const query = isbn13 ? `isbn:${isbn13}` : `${row.Title} ${row.Author}`;

      const result = await searchBookAuto(query);

      if (!result) {
        console.warn(`No match: ${row.Title}`);
        skipped++;
        continue;
      }

      const book = normalizeGoogleBook(result);
      book.rating = parseRating(row["My Rating"]);
      book.dateRead = parseDate(row["Date Read"]);
      book.status = parseStatus(row["Exclusive Shelf"]);

      if (bookExists(book)) {
        skipped++;
        continue;
      }

      writeBook(book, bookToMarkdown(book));
      imported++;

      console.log(`🐐 ${book.title}`);
    } catch (err) {
      console.error(`🪦 Failed: ${row.Title}`);
      console.error(err instanceof Error ? err.message : err);
      skipped++;
    }
  }

  console.log(`\nDone`);
  console.log(`Imported: ${imported}`);
  console.log(`Skipped: ${skipped}`);
})();

function parseRating(value?: string): number | undefined {
  const n = Number(value);
  return n > 0 ? n : undefined;
}

function parseDate(value?: string): string | undefined {
  if (!value) return undefined;
  return value.replace(/\//g, "-");
}

function parseStatus(value?: string): Book["status"] {
  if (value === "read") return true;
  if (value === "to-read") return false;
  if (value === "currently-reading") return false;
  return false;
}
