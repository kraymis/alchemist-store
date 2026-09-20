import type { VercelRequest, VercelResponse } from '@vercel/node'
import { app } from '../src/app.js'
import { connectDatabase } from '../src/config/database.js'

let databasePromise: Promise<void> | null = null

export default async function handler(req: VercelRequest, res: VercelResponse) {
  databasePromise ||= connectDatabase()
  await databasePromise
  return app(req, res)
}
