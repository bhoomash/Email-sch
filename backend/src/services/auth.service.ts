import { prisma, withDbRetry } from '../config/database.js';
import { User } from '@prisma/client';

export class AuthService {
  static async findOrCreateGoogleUser(profile: {
    id: string;
    displayName: string;
    emails?: Array<{ value: string }>;
    photos?: Array<{ value: string }>;
  }): Promise<User> {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      throw new Error('Google OAuth profile did not return an email address');
    }

    const avatar = profile.photos?.[0]?.value || null;

    return withDbRetry(async () => {
      let user = await prisma.user.findUnique({
        where: { googleId: profile.id },
      });

      if (!user) {
        const existingEmailUser = await prisma.user.findUnique({
          where: { email },
        });

        if (existingEmailUser) {
          user = await prisma.user.update({
            where: { id: existingEmailUser.id },
            data: { googleId: profile.id, avatar },
          });
        } else {
          user = await prisma.user.create({
            data: {
              googleId: profile.id,
              email,
              name: profile.displayName || email.split('@')[0],
              avatar,
            },
          });
        }
      }

      return user;
    });
  }

  static async getDevUser(email = 'demo@reachinbox.ai', name = 'Demo User'): Promise<User> {
    return withDbRetry(async () => {
      let user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            googleId: `dev-${Date.now()}`,
            email,
            name,
            avatar: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
          },
        });
      }

      return user;
    });
  }

  static async getUserById(id: string): Promise<User | null> {
    return withDbRetry(async () => {
      return prisma.user.findUnique({
        where: { id },
      });
    });
  }
}
