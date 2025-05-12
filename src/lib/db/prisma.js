import { PrismaClient } from '@prisma-app/client'

export const prisma = global.prisma || new PrismaClient()

if (process.env.NODE_ENV === 'development') global.prisma = prisma
