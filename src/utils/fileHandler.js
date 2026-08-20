const cloudinary = require("cloudinary").v2;
const fs = require("fs");
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

exports.uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    //remove the locally saved temporay file as the uplode opration got failed
    return null;
  }
};

exports.deleteFileOnCloudinary = async (public_Id, resourceType) => {
  if (!public_Id) {
    return null;
  }
  //remove files from cloudinary
  const respons = await cloudinary.uploader.destroy(public_Id, {
    resource_type: resourceType,
  });

  return respons;
};
