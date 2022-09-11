import multer from 'multer'


const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `./uploads/software_updates`);
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split("/")[1];
        cb(null, `${file.fieldname}-${new Date().toISOString().replace(/:/g, '-')}.${ext}`);
    },
});

const multerFilter = (req, file, cb) => {
    if (file.mimetype.split("/")[1] === "zip") {
        cb(null, true);
    } else {
        cb(new Error("unsupported file!!"), false);
    }
};

const upload = multer({
    storage: multerStorage,
    // fileFilter: multerFilter,
});

export { upload }