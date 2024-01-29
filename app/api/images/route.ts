import { NextApiHandler, NextApiRequest } from "next";
import { NextResponse } from "next/server";
import formidable from "formidable";
import path from "path";
import fs from "fs/promises";

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

const readFile = (
  req: NextApiRequest,
  saveLocally?: boolean
): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  const options: formidable.Options = {};
  if (saveLocally) {
    options.uploadDir = path.join(process.cwd(), "/public/images");
    options.filename = (name, ext, path, form) => {
      return Date.now().toString() + "_" + path.originalFilename;
    };
  }
  options.maxFilecollection = 4000 * 1024 * 1024;
  const form = formidable(options);
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });
};

export async function POST (req: NextApiRequest) {
    console.log("postServer");
//   try {
   
//     await fs.readdir(path.join(process.cwd() + "/public", "/images"));
//   } catch (error) {
//     await fs.mkdir(path.join(process.cwd() + "/public", "/images"));
//   }
  await readFile(req, true);
//   res.json({ done: "ok" });
return NextResponse.json( { status: 200 });
};

