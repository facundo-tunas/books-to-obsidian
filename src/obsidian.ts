import fs from "fs";
import path from "path";
import { Book } from "./types";

const BOOKS_DIR = process.env.VAULT_PATH!;

function sanitizeFilename(name: string): string {
  return name
    .replace(/[<>:"/\\|?*]/g, "-")
    .replace(/\s+$/g, "")
    .replace(/\.+$/g, "");
}

export function bookExists(book: Book): boolean {
  if (!fs.existsSync(BOOKS_DIR)) return false;

  const files = fs.readdirSync(BOOKS_DIR);
  return files.some((file) => file.includes(book.googleBooksId));
}

export function writeBook(book: Book, content: string) {
  const filename = sanitizeFilename(book.title);

  const filePath = path.join(BOOKS_DIR, `${filename}.md`);

  fs.writeFileSync(filePath, content, "utf8");
}

export function bookToMarkdown(book: Book): string {
  const authors = book.authors.map((a) => `  - "[[${a}]]"`).join("\n");

  return `---
Title: ${book.title}
Authors:
${authors}
Read: ${book.status ?? false}
Rating: ${book.rating ?? ""}
Date Read: ${book.dateRead ?? ""}
Pages: ${book.pages ?? ""}
Published: ${book.publishedYear ?? ""}
isbn13: ${book.isbn13 ?? ""}
coverUrl: ${
    book.imageLinks?.thumbnail ?? book.imageLinks?.smallThumbnail ?? undefined
  }
---
`;
}
