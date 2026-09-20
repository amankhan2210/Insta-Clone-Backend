const streamifier = require("streamifier");
const cloudinary = require("../configs/cloudinary");

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "my-app-dp",
        resource_type: "auto"
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

module.exports = uploadToCloudinary;    