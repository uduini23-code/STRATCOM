import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers for Zapier
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;
    
    // We use the Firestore REST API to avoid needing the full Firebase Admin SDK in the serverless function
    const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
    const apiKey = process.env.VITE_FIREBASE_API_KEY;
    const databaseId = process.env.VITE_FIREBASE_DATABASE_ID || '(default)';
    
    if (!projectId || !apiKey) {
      throw new Error('Firebase configuration missing in environment variables');
    }

    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/clientRequests?key=${apiKey}`;
    
    // Format the document for the Firestore REST API
    const document = {
      fields: {
        title: { stringValue: data.title || 'Untitled Request' },
        department: { stringValue: data.department || 'Multimedia' },
        eventType: { stringValue: data.eventType || 'PROJECT' },
        requestType: { stringValue: data.requestType || 'Design Request' },
        date: { stringValue: data.date || new Date().toISOString().split('T')[0] },
        startTime: { stringValue: data.startTime || data.time || '09:00' },
        endTime: { stringValue: data.endTime || '17:00' },
        venue: { stringValue: data.venue || '' },
        description: { stringValue: data.description || '' },
        clientName: { stringValue: data.clientName || 'Unknown Client' },
        clientEmail: { stringValue: data.clientEmail || '' },
        status: { stringValue: 'pending_scosec' },
        createdAt: { stringValue: new Date().toISOString() }
      }
    };

    const response = await fetch(firestoreUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(document)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Firestore error: ${errorText}`);
    }

    res.status(200).json({ success: true, message: 'Webhook received and saved to Firestore' });
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
