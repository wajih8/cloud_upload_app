const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 80;

const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const uploadSessions = {};

const jsonPath = path.join(__dirname, 'uploads.json');
let uploadLog = [];
try {
    if (fs.existsSync(jsonPath)) uploadLog = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
} catch(e) {}

function flushLog() {
    fs.writeFile(jsonPath, JSON.stringify(uploadLog, null, 2), err => {
        if (err) console.error('Log write error:', err);
    });
}


const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
});

app.use(express.static('public'));

app.post('/upload-chunk', upload.single('chunk'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file received' });

        const { chunkIndex, totalChunks, originalName, userName, fileId } = req.body;
        const currentIdx = parseInt(chunkIndex);
        const total = parseInt(totalChunks);

        const safeFileId = fileId.replace(/[^a-zA-Z0-9_-]/g, '_');

        // Per-upload temp folder: temp/fileId/
        const sessionTempDir = path.join(uploadDir, 'temp', safeFileId);
        await fs.promises.mkdir(sessionTempDir, { recursive: true });

        // Write chunk to disk immediately as chunk_0, chunk_1, chunk_2...
        const chunkPath = path.join(sessionTempDir, `chunk_${currentIdx}`);
        await fs.promises.writeFile(chunkPath, req.file.buffer);

        // Init session in memory
        if (!uploadSessions[fileId]) {
            uploadSessions[fileId] = {
                received: 0,
                total,
                totalSize: 0,
                originalName,
                userName
            };
        }

        const session = uploadSessions[fileId];
        session.received++;
        session.totalSize += req.file.buffer.length;

        if (session.received === session.total) {
            const userDir = path.join(uploadDir, userName);
            await fs.promises.mkdir(userDir, { recursive: true });

            const s = `${Date.now()}-${originalName}`;
            const finalPath = path.join(userDir, s);

            // Read all chunks from disk in order and concat
            const buffers = [];
            for (let i = 0; i < total; i++) {
                buffers.push(await fs.promises.readFile(path.join(sessionTempDir, `chunk_${i}`)));
            }

            const finalBuffer = Buffer.concat(buffers);

            await fs.promises.writeFile(finalPath, finalBuffer);

            await fs.promises.rm(sessionTempDir, { recursive: true, force: true });

            delete uploadSessions[fileId];
            updateJsonLog(userName, req.ip, s, finalPath, originalName);
            return res.json({ message: 'Upload Complete', completed: true });
        }

        res.json({ message: 'Chunk received' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});


const ADMIN_USER = "admin";
const ADMIN_PASS = "12345";

const basicAuth = (req, res, next) => {
    const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');
    if (login === ADMIN_USER && password === ADMIN_PASS) return next();
    res.set('WWW-Authenticate', 'Basic realm="401"');
    res.status(401).send('Authentication required.');
};

app.get('/admin.html', basicAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/api/uploads', basicAuth, (req, res) => {
    const grouped = uploadLog.reduce((acc, item) => {
        if (!acc[item.uploader]) acc[item.uploader] = [];
        acc[item.uploader].push(item);
        return acc;
    }, {});
    res.json(grouped);
});

function updateJsonLog(user, ip, name, filePath, ons) {
    uploadLog.push({
        id: Date.now(),
        uploader: user,
        ip: ip,
        file: name,
        path: filePath,
        timestamp: new Date(),
        originalName: ons
    });
    flushLog();
    console.log(`------------------------------------------------`);
    console.log(`👤 Uploader: ${user}`);
    console.log(`📂 File Saved: ${ons}`);
    console.log(`------------------------------------------------`);
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));