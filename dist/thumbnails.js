"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getThumbnailPath = getThumbnailPath;
exports.thumbnailExists = thumbnailExists;
exports.downloadThumbnail = downloadThumbnail;
exports.getRelativeThumbnailPath = getRelativeThumbnailPath;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const https_1 = __importDefault(require("https"));
const http_1 = __importDefault(require("http"));
const THUMBNAILS_DIR = path_1.default.join(process.env.VAULT_PATH, "03 - Media", "Books", "thumbnails");
// Ensure thumbnails directory exists
if (!fs_1.default.existsSync(THUMBNAILS_DIR)) {
    fs_1.default.mkdirSync(THUMBNAILS_DIR, { recursive: true });
}
function getThumbnailPath(googleBooksId) {
    return path_1.default.join(THUMBNAILS_DIR, `${googleBooksId}.jpg`);
}
function thumbnailExists(googleBooksId) {
    return fs_1.default.existsSync(getThumbnailPath(googleBooksId));
}
async function downloadThumbnail(url, googleBooksId) {
    // Skip if already exists
    if (thumbnailExists(googleBooksId)) {
        return getThumbnailPath(googleBooksId);
    }
    // Use higher quality image (remove zoom parameter or set to 1)
    const cleanUrl = url.replace(/&?zoom=\d+/, "");
    return new Promise((resolve, reject) => {
        const protocol = cleanUrl.startsWith("https") ? https_1.default : http_1.default;
        const filePath = getThumbnailPath(googleBooksId);
        protocol
            .get(cleanUrl, (res) => {
            if (res.statusCode !== 200) {
                console.warn(`Failed to download thumbnail: ${res.statusCode}`);
                resolve(null);
                return;
            }
            const fileStream = fs_1.default.createWriteStream(filePath);
            res.pipe(fileStream);
            fileStream.on("finish", () => {
                fileStream.close();
                resolve(filePath);
            });
            fileStream.on("error", (err) => {
                fs_1.default.unlink(filePath, () => { }); // Clean up partial file
                reject(err);
            });
        })
            .on("error", (err) => {
            reject(err);
        });
    });
}
function getRelativeThumbnailPath(googleBooksId) {
    return `thumbnails/${googleBooksId}.jpg`;
}
