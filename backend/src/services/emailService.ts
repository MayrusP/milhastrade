import nodemailer from 'nodemailer';

export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: process.env['SMTP_HOST'] || 'smtp.gmail.com',
    port: parseInt(process.env['SMTP_PORT'] || '587'),
    secure: false,
    auth: {
      user: process.env['SMTP_USER'],
      pass: process.env['SMTP_PASS'],
    },
  });

  static async sendWelcomeEmail(email: string, name: string): Promise<void> {
    if (!process.env['SMTP_USER'] || !process.env['SMTP_PASS']) {
      console.log('Email service not configured, skipping welcome email');
      return;
    }

    try {
      await this.transporter.sendMail({
        from: process.env['SMTP_USER'],
        to: email,
        subject: 'Bem-vindo à Plataforma de Troca de Milhas!',
        html: `
          <h1>Olá, ${name}!</h1>
          <p>Bem-vindo à nossa plataforma de troca de milhas aéreas.</p>
          <p>Agora você pode:</p>
          <ul>
            <li>Explorar ofertas de milhas disponíveis</li>
            <li>Criar suas próprias ofertas</li>
            <li>Negociar com outros usuários</li>
          </ul>
          <p>Comece explorando nosso marketplace!</p>
        `,
      });
    } catch (error) {
      console.error('Error sending welcome email:', error);
    }
  }

  static async sendTransactionNotification(
    email: string,
    name: string,
    transactionType: 'new' | 'confirmed' | 'completed',
    offerTitle: string
  ): Promise<void> {
    if (!process.env['SMTP_USER'] || !process.env['SMTP_PASS']) {
      console.log('Email service not configured, skipping transaction notification');
      return;
    }

    const subjects = {
      new: 'Nova transação iniciada',
      confirmed: 'Transação confirmada',
      completed: 'Transação concluída',
    };

    const messages = {
      new: `Uma nova transação foi iniciada para sua oferta "${offerTitle}".`,
      confirmed: `Sua transação para "${offerTitle}" foi confirmada pelo vendedor.`,
      completed: `Sua transação para "${offerTitle}" foi marcada como concluída.`,
    };

    try {
      await this.transporter.sendMail({
        from: process.env['SMTP_USER'],
        to: email,
        subject: subjects[transactionType],
        html: `
          <h1>Olá, ${name}!</h1>
          <p>${messages[transactionType]}</p>
          <p>Acesse sua conta para ver mais detalhes.</p>
        `,
      });
    } catch (error) {
      console.error('Error sending transaction notification:', error);
    }
  }
}