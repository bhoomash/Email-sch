import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@reachinbox.ai' },
    update: {},
    create: {
      googleId: 'google-demo-id-12345',
      name: 'Demo User',
      email: 'demo@reachinbox.ai',
      avatar: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
    },
  });

  console.log(`Created/found demo user: ${user.name} (${user.id})`);

  // Check if user already has a sender
  const existingSender = await prisma.sender.findFirst({
    where: { userId: user.id },
  });

  if (!existingSender) {
    // Generate test ethereal account
    console.log('Creating Ethereal test SMTP account...');
    const testAccount = await nodemailer.createTestAccount();

    const sender = await prisma.sender.create({
      data: {
        userId: user.id,
        email: testAccount.user,
        smtpHost: testAccount.smtp.host,
        smtpPort: testAccount.smtp.port,
        smtpUser: testAccount.user,
        smtpPassword: testAccount.pass,
      },
    });

    console.log(`Created default Ethereal sender: ${sender.email}`);
  } else {
    console.log(`Sender already exists: ${existingSender.email}`);
  }

  console.log('Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
