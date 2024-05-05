import express, { Request, Response } from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import cors from 'cors';
import { Filter, ParseReuslt, ResponseData } from './types';

const app = express();
app.use(cors());
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
      const results = await processCSV(req.file.path);
      res.json(results)
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }

  });
});

// Parse a previously uploaded CSV file and send back JSON representation
app.get('/parse/:filename', async (req: Request, res: Response) => {
  try {
    const filePath = path.join(__dirname, '../uploads', req.params.filename);

    const filter: Filter = {
      searchField: req.query.searchField as string || '',
      searchValue: req.query.searchValue as string || '',
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10
    };

    const results: ParseReuslt = await processCSV(filePath, filter);
    const response: ResponseData = {
      data: results.data,
      rowCount: results.data.length,
      currentPage: filter.page,
      totalPages: Math.ceil(results.rowCount / filter.limit),
    };
    res.json(response)
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.get('/headers/:filename', async (req: Request, res: Response) => {
  try {
    const filePath = path.join(__dirname, '../uploads', req.params.filename);
    // read the first row of the CSV file
    const results = await readCSVHeader(filePath);
    res.json({ headers: results })
  } catch (error) {
    console.error(error);
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


function readCSVHeader(filePath: string): Promise<string[]> {
  return new Promise<string[]>((resolve, reject) => {
    const headers: string[] = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('headers', (headerList: string[]) => {
        if (Array.isArray(headerList)) {
          headerList.forEach(header => {
            headers.push(header.trim()); // Trim whitespace from headers
          });
          resolve(headers);
        } else {
          reject(new Error('Headers must be an array of strings'));
        }
      })
      .on('error', (err: NodeJS.ErrnoException) => {
        reject(err);
      });
  });
}
async function processCSV(filePath: string, filter?: Filter): Promise<ParseReuslt> {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    let count: number = 0;
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        // No filter, add all data
        if (!filter) {
          results.push(data);
          return;
        }
        // Apply filter
        if (
          filter.searchField === '' ||
          (data[filter.searchField] && data[filter.searchField].includes(filter.searchValue))
        ) {
          count++;
          if (count > (filter.page - 1) * filter.limit && count <= filter.page * filter.limit) {
            results.push(data);
          }
        }
      })
      .on('end', () => {
        resolve({ data: results, rowCount: count })
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}


app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
