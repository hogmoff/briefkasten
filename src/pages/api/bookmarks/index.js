import prisma from '@/lib/prisma'
import { getSession } from 'next-auth/react'

export default async function handler(req, res) {
  const session = await getSession({ req })
  const { method } = req

  if (session) {
    switch (method) {
      case 'GET':
        return res.status(200).json({ results: ['Hello', 'World'] })
      case 'DELETE':
        const { id, userId } = JSON.parse(req.body)

        if (!id || !userId) {
          return res.status(400).json({ message: 'Missing required field(s)' })
        }
        try {
          await prisma.bookmark.delete({
            where: { id },
          })
          await prisma.tagsOnBookmarks.delete({
            where: { bookmarkId_tagId: { bookmarkId: id, tagId: '123' } },
          })
        } catch (error) {
          console.error('ERR', error)
          return res.status(500).json({ message: error })
        }
        return res.status(200).json({ message: 'Deleted' })
      default:
        res.setHeader('Allow', ['GET', 'DELETE'])
        res.status(405).end(`Method ${method} Not Allowed`)
    }
  } else {
    console.error('ERR - Unauthorized attempt at /api/bookmarks')
    return res.status(403).end('Unauthorized')
  }
}
