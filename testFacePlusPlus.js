const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

require('dotenv').config();

const apiKey = process.env.FACE_PLUS_PLUS_API_KEY;
const apiSecret = process.env.FACE_PLUS_PLUS_API_SECRET;


const imagePath = "./face.jpg"; // Make sure this image exists!

async function detectEmotion() {
  const form = new FormData();
  form.append("api_key", apiKey);
  form.append("api_secret", apiSecret);
  form.append("image_file", fs.createReadStream(imagePath));
  form.append("return_attributes", "emotion");

  try {
    const response = await axios.post(
      "https://api-us.faceplusplus.com/facepp/v3/detect",
      form,
      {
        headers: form.getHeaders(),
      }
    );

    console.log("Detected emotions:");
    console.log(JSON.stringify(response.data.faces[0].attributes.emotion, null, 2));
  } catch (err) {
    console.error("Error:", err.response?.data || err.message);
  }
}

detectEmotion();
