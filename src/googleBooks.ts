import readline from "readline";
import { Book } from "./types";

const BASE_URL = "https://www.googleapis.com/books/v1/volumes";


// for goodreads csv (using ISBN so no choosing from options)
export async function searchBookAuto(query: string): Promise<any | null> {
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
export async function fetchBook(query: string, maxResults = 5): Promise<any[]> {
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

export async function pickBook(items: any[]): Promise<any> {
  if (items.length === 0) {
    console.log("No books found :(");
    throw new Error("No books to pick from");
  }

  if (items.length === 1) {
    return items[0];
  }

  items.forEach((item, i) => {
    const info = item.volumeInfo;
    console.log(
      `${i + 1}. ${info.title} — ${info.authors?.join(", ") ?? "Unknown"} (${info.publishedDate ?? "?"})`,
    );
  });

  const answer = await ask(`Choose a book (1-${items.length}): `);
  const index = Number(answer) - 1;

  if (Number.isNaN(index) || index < 0 || index >= items.length) {
    throw new Error("Invalid selection");
  }

  return items[index];
}

function ask(question: string): Promise<string> {
  const rl = readline.createInterface({
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

export function normalizeGoogleBook(item: any): Book {
  const info = item.volumeInfo;

  const isbn13 = info.industryIdentifiers?.find(
    (id: any) => id.type === "ISBN_13"
  )?.identifier;

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
