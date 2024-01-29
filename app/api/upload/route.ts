// pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';

const upload = multer({ dest: 'public/assets/images' });

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  upload.single('image')(req , res, (err: any) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // File is now uploaded to the 'public/assets/images' folder
    return res.status(200).json({ message: 'File uploaded successfully' });
  });
}
