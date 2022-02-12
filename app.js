const express = require('express');
const app = express();
const fs = require('fs');
const multer = require('multer');//for uploading the multiple files
const { TesseractWorker } = require("tesseract.js");
const worker = new TesseractWorker();//here i use older version so that i can use old features
//to convert the uploaded image into ocr (inbuilt package)
// Error : do not use the tesseractWorker because it is deprecated so always use createWorker and then create ur own worker to work  it properly.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './upload');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage }).single('avatar');//here avatar is a file name

// to check the documents in ejs
app.set('view engine', 'ejs');
app.use(express.static('public'));
//home  page 
app.get('/', (req, res) => {
  res.render("index");
})

//route to upload
app.post('/upload', (req, res) => {
  upload(req, res, err => {
    //read the file that user uploaded
    // console.log(req.file);
    if (req.file.originalname === undefined) {
      res.send('<h1>404 Page not found .</h1>');
    }
    fs.readFile(`./upload/${req.file.originalname}`, (err, data) => {
      if(err)  return console.log("Error Found !",err);
      //to recoginse the file user uploaded with the help of tesseract
      worker
        .recognize(data, "eng", { __dirname: '1' })
        .progress(progress => {
          // console.log('Progress -> ',progress);
        })
        .then(result => {
          // res.send(result.text)
          res.render('upload', {
            result:result.text
          });
        })
        .finally(() => worker.terminate());
      });
    });
});
//to make it run properly use ROUTES so start making routes to make it work
//start up the sever
let port =  process.env.PORT || 8080;
// NOTE: Here  process.env.PORT this automatically recognise the port number when we upload the file on the server

app.listen(port, () => {
  console.log('Server starts running..Here we go on the Port ' , port);
})
