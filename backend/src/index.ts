import express, { Request, Response } from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const app = express();
const port = 8001;

// Set storage engine
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, constructUniqueFileName(file));
  }
});

// So that the uploaded files are not overwritten
const constructUniqueFileName = (file: Express.Multer.File) => {
  const filename = path.parse(file.originalname).name
  return `${filename}-${uuidv4()}.csv`
}

// Init upload
const upload = multer({
  storage: storage,
  fileFilter: function(req, file, cb) {
    if (file.mimetype === 'text/csv') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
}).single('csvfile');

// Handle CSV file upload
app.post('/upload', (req: Request, res: Response) => {
  upload(req, res, async (err: any) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    } else if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }


    try {
      // Process uploaded CSV file asynchronously
      const results: any[] = await processCSV(req.file.path);
      res.json({ data: results });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }

  });
});
// Parse a previously uploaded CSV file and send back JSON representation
app.get('/parse/:filename', async (req: Request, res: Response) => {
  try {
    const fileName = req.params.filename + '.csv';
    const filePath = path.join(__dirname, '../uploads', fileName);
    const results: any[] = await processCSV(filePath);
    res.json({ data: results });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// list all the files in the uploads directory
app.get('/listFiles', (req: Request, res: Response) => {
  const uploadDirectory = path.join(__dirname, '../uploads');
  fs.readdir(uploadDirectory, (err, files) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json({ files: files });
    }
  });
});

async function processCSV(filePath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
