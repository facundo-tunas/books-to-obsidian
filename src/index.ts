import { fetchBook, normalizeGoogleBook } from "./googleBooks";
import { bookExists, writeBook, bookToMarkdown } from "./obsidian";

const query = process.argv.slice(2).join(" ");

if (!query) {
  console.error("Usage: fetch-book <query>");
  process.exit(1);
}

(async () => {
  const raw = await fetchBook(query);
  const book = normalizeGoogleBook(raw);

  if (bookExists(book)) {
    console.log("Book already exists in vault");
    return;
  }

  const markdown = bookToMarkdown(book);
  writeBook(book, markdown);

  console.log(`Added: ${book.title}`);
})();
