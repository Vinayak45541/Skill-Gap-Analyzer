import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';
import User from '../models/User.js';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Call Python to extract PDF text
const extractPdfText = (filePath) => {
  return new Promise((resolve, reject) => {
    const pyPath = path.join(process.cwd(), 'python', 'extract_pdf.py');
    execFile('python', [pyPath, filePath], (err, stdout, stderr) => {
      if (err) return reject(err);
      resolve(stdout); // Python prints text to stdout
    });
  });
};

// Call Gemini API
const callGemini = async (prompt) => {
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
  const resp = await axios.post(url, { contents: [{ parts: [{ text: prompt }] }] }, {
    headers: {
      'x-goog-api-key': process.env.GEMINI_API_KEY,
      'Content-Type': 'application/json'
    }
  });
  return resp.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
};

// Upload route
export const uploadResume = async (req, res) => {
  const { email, role } = req.body;
  if (!req.file || !email || !role) return res.status(400).json({ error: 'Resume, email & role required' });

  try {
    const txt = await extractPdfText(req.file.path);
    const prompt = `Role: ${role}\nResume text:\n${txt}\nReturn JSON: skills_present[], skills_missing[], suggested_improvements[]`;
    const geminiResp = await callGemini(prompt);

    await User.findOneAndUpdate(
      { email },
      { $push: { geminiResponses: { role, responseText: geminiResp } } },
      { new: true }
    );

    fs.unlinkSync(req.file.path); // delete PDF
    res.json({ ok: true, geminiResp });
  } catch (err) {
    try { fs.unlinkSync(req.file.path); } catch(e){}
    res.status(500).json({ error: err.message });
  }
};
