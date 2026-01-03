"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const googleBooks_1 = require("./googleBooks");
const obsidian_1 = require("./obsidian");
const query = process.argv.slice(2).join(" ");
if (!query) {
    console.error("Usage: fetch-book <query>");
    process.exit(1);
}
(async () => {
    const raw = await (0, googleBooks_1.fetchBook)(query);
    const book = (0, googleBooks_1.normalizeGoogleBook)(raw);
    if ((0, obsidian_1.bookExists)(book)) {
        console.log("Book already exists in vault");
        return;
    }
    const markdown = (0, obsidian_1.bookToMarkdown)(book);
    (0, obsidian_1.writeBook)(book, markdown);
    console.log(`Added: ${book.title}`);
})();
