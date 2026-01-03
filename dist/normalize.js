"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeGoogleBook = normalizeGoogleBook;
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
