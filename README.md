# Cloud Media Upload System

A lightweight Node.js application that simplifies uploading images and videos to cloud storage. Users can select multiple files, upload them in a single operation, and receive confirmation once the upload is completed. The system also tracks upload activity and provides an admin dashboard for monitoring all user uploads.

## Features

### User Features

* Upload images and videos to cloud storage.
* Multiple file selection support.
* Upload confirmation after successful upload.
* Simple and responsive web interface.
* User upload tracking and history.

### Admin Features

* View all uploaded files.
* Track which user uploaded each file.
* Monitor upload activity.
* Access centralized upload logs.

## Technologies Used

* Node.js
* Express.js
* Multer
* HTML/CSS/JavaScript

## Dependencies

```bash
npm install express multer
```

## Project Structure

```text
project/
│
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── server.js
├── uploads.json
├── package.json
└── README.md
```

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/wajih8/cloud_upload_app.git
cd cloud_upload_app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Server

```bash
node server.js
```

Or if your package.json contains a start script:

```bash
npm start
```

## Access the Application

Open your browser and navigate to:

```text
http://localhost:3000
```

## How It Works

1. Open the web interface.
2. Enter your username.
3. Select one or more images/videos.
4. Click Upload.
5. Files are uploaded to the cloud.
6. Upload details are stored in `uploads.json`.
7. The admin dashboard can view all upload records.

## Upload Tracking

Each upload record contains information such as:

* Username
* File name
* Upload date and time
* Upload status

The upload history is stored in:

```text
uploads.json
```

## Example Record

```json
{
  "user": "john",
  "fileName": "vacation.mp4",
  "uploadDate": "2026-06-21T15:30:00Z",
  "status": "Uploaded"
}
```

## Running in Development Mode

Install Nodemon:

```bash
npm install -g nodemon
```

Run:

```bash
nodemon server.js
```

## Security Recommendations

* Validate file types before upload.
* Limit maximum file size.
* Add user authentication.
* Protect admin routes.
* Sanitize user input.

## License

This project is available for educational and personal use.
