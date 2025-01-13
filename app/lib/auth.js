import bcrypt from 'bcryptjs'
import prisma from './prisma'

export async function hashPassword(password) {
    return await bcrypt.hash(password, 12)
}

export async function verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword)
}

export async function findUserByEmail(email) {
    return prisma.user.findUnique({
        where: { email },
        include: {
            profile: true,
            creatorProfile: true,
        },
    })
}