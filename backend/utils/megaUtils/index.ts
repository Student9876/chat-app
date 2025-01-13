import { Storage } from "megajs";
import { Readable } from "stream";
import { MegaFile } from "../../../types"

const credentials = {
    email: process.env.MEGA_EMAIL || "zeondivine@gmail.com", // Your Mega email
    password: process.env.MEGA_PASSWORD || "Sassy@123", // Your Mega password
};

export const uploadToMega = async (file: Express.Multer.File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const megaStorage = new Storage(credentials);

        megaStorage.login((error) => {
            if (error) return reject(error);

            const uploadStream = megaStorage.upload({ name: file.originalname });
            const readableStream = Readable.from(file.buffer);

            readableStream.pipe(uploadStream);

            uploadStream.on("complete", (file: MegaFile) => {
                file.link(() => {
                    if (typeof file.link === "function") {
                        file.link((err, link: string) => {
                            if (err) return reject(err);
                            resolve(link);
                        });
                    } else {
                        reject(new Error("File link method is not available"));
                    }
                });
            });

            uploadStream.on("error", reject);
        });
    });
};
