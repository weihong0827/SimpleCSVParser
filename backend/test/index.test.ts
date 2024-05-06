import request from 'supertest';
import fs from 'fs';
import path from 'path';
import app, { server } from '../src/index';


afterAll((done) => {
  server.close(done);
});

describe('CSV Upload API', () => {
  const testCSVPath = path.join(__dirname, 'test.csv');

  afterEach(() => {
    // Clean up after each test
    if (fs.existsSync(testCSVPath)) {
      fs.unlinkSync(testCSVPath);
    }
  });

  it('should upload a CSV file', async () => {
    // Create a test CSV file
    fs.writeFileSync(testCSVPath, 'header1,header2\nvalue1,value2');

    const response = await request(app)
      .post('/upload')
      .attach('csvfile', testCSVPath);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
  });

  it('should return an error if no file is uploaded', async () => {
    const response = await request(app).post('/upload');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'No file uploaded');
  });

  it('should return an error if file uploaded is not CSV', async () => {
    const testTXTPath = path.join(__dirname, 'test.txt');
    fs.writeFileSync(testTXTPath, 'This is a text file');

    const response = await request(app)
      .post('/upload')
      .attach('csvfile', path.join(__dirname, 'test.txt')); // Uploading a non-CSV file

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Only CSV files are allowed');
  });

});

describe('CSV Parse API', () => {
  const testFilename = 'test.csv';

  beforeAll(async () => {
    // Prepare a test CSV file
    fs.writeFileSync(path.join(__dirname, '../uploads', testFilename), 'header1,header2\nvalue1,value2');
  });

  afterAll(() => {
    // Clean up after all tests
    // fs.unlinkSync(path.join(__dirname, '../uploads', testFilename));
  });

  it('should parse a CSV file', async () => {
    const response = await request(app).get(`/parse/${testFilename}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('rowCount', 1);
    expect(response.body).toHaveProperty('currentPage', 1);
    expect(response.body).toHaveProperty('totalPages', 1);
  });

  it('should return an error if the requested file does not exist', async () => {
    const nonExistentFilename = 'non_existent.csv';
    const response = await request(app).get(`/parse/${nonExistentFilename}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'File not found');
  });
  it('should handle pagination in CSV parsing', async () => {
    // Writing multiple entries to simulate pagination
    const largeCSVContent = "header1,header2\n" + Array.from({ length: 50 }, (_, i) => `value1_${i},value2_${i}`).join('\n');
    fs.writeFileSync(path.join(__dirname, '../uploads', testFilename), largeCSVContent);

    const response = await request(app).get(`/parse/${testFilename}?limit=10&page=2`);
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(10);
    expect(response.body.currentPage).toBe(2);
  });
  it('should parse a CSV file and apply filters correctly', async () => {
    const response = await request(app)
      .get(`/parse/${testFilename}?searchField=header1&searchValue=value1_39`);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.totalPages).toBe(1);
    expect(response.body.data[0].header1).toBe('value1_39');
  });

});

describe('CSV Headers API', () => {
  const testFilename = 'test.csv';

  beforeAll(async () => {
    // Prepare a test CSV file
    fs.writeFileSync(path.join(__dirname, '../uploads', testFilename), 'header1,header2\nvalue1,value2');
  });

  afterAll(() => {
    // Clean up after all tests
    fs.unlinkSync(path.join(__dirname, '../uploads', testFilename));
  });

  it('should return headers of a CSV file', async () => {
    const response = await request(app).get(`/headers/${testFilename}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('headers');
    expect(response.body.headers).toEqual(['header1', 'header2']);
  });

  it('should return an error if the requested file does not exist', async () => {
    const nonExistentFilename = 'non_existent.csv';
    const response = await request(app).get(`/headers/${nonExistentFilename}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'File not found');
  });

});

describe('List Files API', () => {
  const testFiles = ['test1.csv', 'test2.csv'];

  beforeAll(async () => {
    // Create test CSV files
    testFiles.forEach(filename => {
      fs.writeFileSync(path.join(__dirname, '../uploads', filename), 'header1,header2\nvalue1,value2');
    });
  });

  afterAll(() => {
    // Clean up after all tests
    testFiles.forEach(filename => {
      fs.unlinkSync(path.join(__dirname, '../uploads', filename));
    });
  });

  it('should list all CSV files in the uploads directory', async () => {
    const response = await request(app).get('/listFiles');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('files');
    expect(response.body.files).toEqual(expect.arrayContaining(testFiles));
  });

});
