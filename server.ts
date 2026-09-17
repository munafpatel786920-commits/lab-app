/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';
import {
  DEFAULT_TESTS,
  INITIAL_STAFF,
  INITIAL_INVENTORY,
  INITIAL_SETTINGS,
  INITIAL_PATIENTS,
  INITIAL_REPORTS,
  INITIAL_INVOICES,
  INITIAL_APPOINTMENTS,
  INITIAL_HOME_VISITS,
  INITIAL_EXPENSES
} from './src/mockData';

dotenv.config();

// Lazy initialization of GoogleGenAI to prevent crash if key is missing on start
let genAIClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set. Please add it under Settings > Secrets.');
    }
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  const PORT = 3000;

  // 1. API route: AI Report Summary Generator
  app.post('/api/gemini-summary', async (req: Request, res: Response) => {
    try {
      const { testName, patientName, patientAge, patientGender, doctorRef, parameters, doctorRemarks } = req.body;

      if (!testName || !parameters) {
        res.status(400).json({ error: 'Missing required report parameters' });
        return;
      }

      // Safeguard API Key access
      const ai = getGenAI();

      // Formulate the medical context prompt
      const prompt = `
You are a highly qualified Consultant Pathologist and Medical Clinical Analyst AI.
Please analyze the following patient's pathology report values and produce a professional, empathetic, and clinically precise patient-friendly summary.

PATIENT PROFILE:
- Name: ${patientName || 'Anonymous'}
- Age: ${patientAge || 'N/A'}
- Gender: ${patientGender || 'General'}
- Referring Doctor: ${doctorRef || 'Self Reference'}

TEST ANALYZED:
- Test Title: ${testName}
- Doctor Remarks: ${doctorRemarks || 'No direct clinical comments provided.'}

TEST PARAMETER RESULTS:
${JSON.stringify(parameters, null, 2)}

SUMMARY REQUIREMENTS:
1. Provide a professional, encouraging, and clear medical summary (2-3 short paragraphs).
2. Clearly identify any highlighted values (High or Low) and what they mean physiologically in simple, layman's terms.
3. Suggest practical dietary, lifestyle, or follow-up consult advice appropriate for these findings.
4. Keep the tone professional, comforting, objective, and clear.
5. End with a standard professional disclaimer that this summary is an AI translation of clinical values and should be discussed with their primary physician.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
      });

      const summaryText = response.text;
      res.json({ summary: summaryText });
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      res.status(500).json({
        error: error.message || 'Failed to generate AI clinical summary. Verify your Gemini API Key in the Secrets menu.'
      });
    }
  });

  const DB_FILE = path.join(process.cwd(), 'db.json');

  function getInitialDbState() {
    return {
      patients: INITIAL_PATIENTS,
      reports: INITIAL_REPORTS,
      invoices: INITIAL_INVOICES,
      appointments: INITIAL_APPOINTMENTS,
      homeVisits: INITIAL_HOME_VISITS,
      inventory: INITIAL_INVENTORY,
      staff: INITIAL_STAFF,
      expenses: INITIAL_EXPENSES,
      tests: DEFAULT_TESTS,
      settings: INITIAL_SETTINGS
    };
  }

  // API Route: Get state
  app.get('/api/data', (req: Request, res: Response) => {
    try {
      if (!fs.existsSync(DB_FILE)) {
        const initialState = getInitialDbState();
        fs.writeFileSync(DB_FILE, JSON.stringify(initialState, null, 2), 'utf-8');
        res.json(initialState);
        return;
      }
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(raw);
      
      let modified = false;
      const initial = getInitialDbState();
      if (!data.patients || !Array.isArray(data.patients) || data.patients.length === 0) {
        data.patients = initial.patients;
        modified = true;
      }
      if (!data.reports || !Array.isArray(data.reports) || data.reports.length === 0) {
        data.reports = initial.reports;
        modified = true;
      }
      if (!data.invoices || !Array.isArray(data.invoices) || data.invoices.length === 0) {
        data.invoices = initial.invoices;
        modified = true;
      }
      if (modified) {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
      }
      res.json(data);
    } catch (error) {
      console.error('Failed to read db.json:', error);
      res.status(500).json({ error: 'Failed to retrieve data from server storage' });
    }
  });

  // API Route: Save state
  app.post('/api/data', (req: Request, res: Response) => {
    try {
      const data = req.body;
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to write to db.json:', error);
      res.status(500).json({ error: 'Failed to save data to server storage' });
    }
  });

  // API Route: Reset state
  app.post('/api/clear', (req: Request, res: Response) => {
    try {
      const emptyState = getInitialDbState();
      fs.writeFileSync(DB_FILE, JSON.stringify(emptyState, null, 2), 'utf-8');
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to clear db.json:', error);
      res.status(500).json({ error: 'Failed to reset server storage' });
    }
  });

  // 2. Vite Middleware Integration for Development
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ApexLab Backend] Server running at http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start full-stack server:', err);
});
