/* ****************************************************************
// this is the olde multer, uses disk storage to save image

import multer from 'multer';

// diskStorage gives you full control on storing files to disk
const storage = multer.diskStorage({
  // destination that files are saved to
  destination: function (req, file, cb) {
    cb(null, '__uploads');
  },
  filename: function (req, file, cb) {
    // set filename
    const filename = `${Date.now()}.jpg`;
    cb(null, filename);
  },
});

// Export multer instance
export const upload = multer({
  storage: storage,
  limits: {
    // fileSize: 5000000, //5 MB
  },
  fileFilter(req, file, cb) {
    if (file.mimetype !== 'image/jpeg') {
      // upload only png and jpg format
      return cb(new Error('Please upload a Image'));
    }
    cb(null, true);
  },
});
*****************************************************************/

// this is the current multer, uses memory storage to send buffer to call chatgpt
import multer from 'multer';

export const upload = multer({
  storage: multer.memoryStorage(), // Changed to memoryStorage
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB (GPT-4 Vision limit)
  },
  fileFilter(req, file, cb) {
    // Allow both JPEG and PNG formats
    if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
      return cb(new Error('Please upload a JPEG or PNG image'));
    }
    cb(null, true);
  },
});

/* ****************************************************************
// below is the solution provided by claude to work with diskStorage while still getting the buffer for the GPT API

Yes, there are several ways to work with diskStorage while still getting the buffer for the GPT API. Here are two approaches:

1. First approach - Read file after disk storage:

```typescript
import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = '__uploads';

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = `${uniqueSuffix}${path.extname(file.originalname)}`;
    cb(null, filename);
  },
});

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  },
  fileFilter(req, file, cb) {
    if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
      return cb(new Error('Please upload a JPEG or PNG image'));
    }
    cb(null, true);
  },
});
```

Then modify your GptService:

```typescript
import fs from 'fs/promises';
import path from 'path';

export class GptService {
  public async sendToGpt(file: Express.Multer.File): Promise<GptResponse> {
    try {
      if (!file) {
        throw new Error('No file provided');
      }

      // Read file from disk
      const filePath = path.join(file.destination, file.filename);
      const buffer = await fs.readFile(filePath);
      
      const base64Image = buffer.toString('base64');

      // Clean up: Remove file after processing
      await fs.unlink(filePath).catch(console.error);

      const requestData = {
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'system',
            content: gptSystemContext,
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:${file.mimetype};base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
      };

      // Rest of your code...
      
    } catch (error) {
      // Error handling...
    }
  }
}
```

2. Second approach - Use both disk storage and memory storage:

```typescript
import multer from 'multer';
import path from 'path';

const UPLOAD_DIR = '__uploads';

// Configure both storages
const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = `${uniqueSuffix}${path.extname(file.originalname)}`;
    cb(null, filename);
  },
});

const memoryStorage = multer.memoryStorage();

// Create two different multer instances
export const uploadToDisk = multer({
  storage: diskStorage,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
  fileFilter(req, file, cb) {
    if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
      return cb(new Error('Please upload a JPEG or PNG image'));
    }
    cb(null, true);
  },
});

export const uploadToMemory = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
  fileFilter(req, file, cb) {
    if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
      return cb(new Error('Please upload a JPEG or PNG image'));
    }
    cb(null, true);
  },
});

// Helper function to process multiple uploads
export const uploadBoth = (fieldName: string) => [
  uploadToDisk.single(`${fieldName}_disk`),
  uploadToMemory.single(`${fieldName}_memory`),
];
```

Then in your route:

```typescript
// Use array of middleware
router.post('/ask', uploadBoth('image'), GptController.ask);
```

And modify your controller:

```typescript
export const GptController = {
  async ask(req: Request, res: Response) {
    try {
      // Access both files
      const diskFile = req.files?.['image_disk']?.[0];
      const memoryFile = req.files?.['image_memory']?.[0];

      if (!diskFile || !memoryFile) {
        return res.status(400).json({ 
          success: false, 
          message: 'No files available' 
        });
      }

      const gptService = new GptService();
      // Use memoryFile for GPT processing
      const data = await gptService.sendToGpt(memoryFile);

      res.status(200).json({ 
        success: true, 
        message: 'Processed successfully',
        diskPath: diskFile.path, // Save this path if needed
        data 
      });

    } catch (err) {
      // Error handling...
    }
  },
};
```

The first approach is simpler but involves extra I/O operations. The second approach is more complex but more efficient as it handles both storage types simultaneously.

Additional considerations:

1. Add file cleanup logic:
```typescript
// Utility function to clean up old files
export const cleanupOldFiles = async (directory: string, maxAgeHours = 24) => {
  try {
    const files = await fs.readdir(directory);
    const now = Date.now();
    
    for (const file of files) {
      const filePath = path.join(directory, file);
      const stats = await fs.stat(filePath);
      
      const ageHours = (now - stats.mtimeMs) / (1000 * 60 * 60);
      if (ageHours > maxAgeHours) {
        await fs.unlink(filePath);
      }
    }
  } catch (error) {
    console.error('Cleanup error:', error);
  }
};
```

2. Add error handling for disk operations:
```typescript
try {
  // Ensure upload directory exists
  await fs.access(UPLOAD_DIR);
} catch {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}
```

Would you like me to elaborate on any of these approaches or show you how to implement additional features like file type validation or cleanup scheduling?
*/
