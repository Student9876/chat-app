import { v2 as cloudinary } from "cloudinary";

export const cloudinaryConfig = (cloudName: string, apiKey: string, apiSecret: string): void => {
    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
    });
    console.log("Cloudinary initialized");
}
export default cloudinary;
