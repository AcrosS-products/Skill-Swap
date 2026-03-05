const User = require("../Model/User");
const cloudinary = require("cloudinary").v2;

// Utility: Upload file to Cloudinary
function uploadFileToCloudinary(fileBuffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(fileBuffer); // MUST BE A BUFFER
  });
}

// File Upload Handler
exports.fileUpload = async (req, res) => {
  // console.log("🕉️ OM Namah SHIVAYA");

  try {
    const file = req.file;

    // ===============================
    // 1️⃣ FILE EXISTS CHECK
    // ===============================
    if (!file) {
      console.log("No file received");
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // ===============================
    // 2️⃣ FILE SIZE LIMIT (ADDED)
    // ===============================
    const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
    if (file.size > MAX_SIZE) {
      return res.status(400).json({
        success: false,
        message: "File size exceeds 10MB limit",
      });
    }

    // ===============================
    // 3️⃣ MIME TYPE VALIDATION (ADDED)
    // ===============================
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "video/mp4",
      "video/webm",
      "application/pdf",
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file type",
      });
    }

    // ===============================
    // 4️⃣ EXTENSION CHECK (OPTIONAL)
    // ===============================
    const allowedExt = ["jpeg", "jpg", "png", "mp4", "webm", "pdf"];
    const ext = file.originalname.split(".").pop().toLowerCase();

    if (!allowedExt.includes(ext)) {
      return res.status(400).json({
        success: false,
        message: "Unsupported file extension",
      });
    }

    // ===============================
    // 5️⃣ UPLOAD TO CLOUDINARY
    // ===============================
    const uploadedFile = await uploadFileToCloudinary(
      file.buffer,
      "SkillSwap"
    );

    // ===============================
    // 6️⃣ SAVE URL IN USER MODEL
    // ===============================
    const {title, description} = req.body;

    await User.findByIdAndUpdate(req.user.id, {
      $push: {
        content: {
          title,
          description,
          type: "file",
          url: uploadedFile.secure_url
        }
      }
    }, {
        runValidators: true
    });


    // ===============================
    // 7️⃣ RESPONSE
    // ===============================
    return res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      fileURL: uploadedFile.secure_url,
    });

  } catch (error) {
    console.error("File upload error:", error);
    return res.status(500).json({
      success: false,
      message: "File upload failed",
      error: error.message,
    });
  }
};

exports.linkUpload = async (req, res) => {

    try {
        // console.log("🕉️ OM Namah SHIVAYA");
        if (!req.body) {
            res.status(400).json({
                success: false,
                message: "No link found",
            });
        }

        const formdata = req.body;
        await User.findByIdAndUpdate(req.user.id, {
            $push: {
                content: {
                    title: formdata.title,
                    description: formdata.description,
                    type: "link",
                    url: formdata.data
                }
            }
        });

        return res.status(200).json({
            success: true,
            message: "Link uploaded successfully"
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Link couldn't be uploaded",
            error: error.message
        });
    }

}

exports.getMyContent = async(req, res) => {

    console.log(`req`);

    try {

        const teachContent = await User.findById(req.params.tutorId).select('content');
        
        return res.status(200).json({
            success: true,
            items: teachContent
        });


    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Link couldn't be uploaded",
            error: error.message
        });
    }

}