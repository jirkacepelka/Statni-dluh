/**
 * Serverless endpoint na Vercelu. Tenký adaptér — veškerá logika je
 * v `shared/api.ts`, aby ji mohl sdílet i dev server.
 */

import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleApiRequest } from '../shared/api';

export default function handler(req: IncomingMessage, res: ServerResponse): void {
  const url = new URL(req.url ?? '/', `https://${req.headers.host ?? 'localhost'}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, OPTIONS',
    });
    res.end();
    return;
  }

  if (req.method !== 'GET') {
    res.writeHead(405, { 'content-type': 'application/json; charset=utf-8', allow: 'GET, OPTIONS' });
    res.end(JSON.stringify({ chyba: 'Podporována je jen metoda GET.' }));
    return;
  }

  const { status, headers, body } = handleApiRequest(url);
  res.writeHead(status, headers);
  res.end(body);
}
