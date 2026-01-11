import 'dotenv/config'
import { PrismaClient } from '../../generated/prisma-client/client.ts'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const pool    = new pg.Pool({ connectionString: process.env.DATABASE_URL }),
      adapter = new PrismaPg(pool)

export const prisma = global.prisma || new PrismaClient({ adapter })

if (process.env.NODE_ENV === 'development') global.prisma = prisma
