const { Resend } = require('resend');
const logger = require('./logger.util.js');

const resend = new Resend(process.env.RESEND_API_KEY);

const mailer = async function (to, subject, html) {
	if (!to || !subject || !html) {
		logger.error(`Error sending email, ${to} ${subject}`);
		return {
			success: false,
			msg: 'Parâmetros inválidos para envio de email'
		};
	}

	try {
		const { data, error } = await resend.emails.send({
			from: process.env.EMAIL_FROM,
			to: Array.isArray(to) ? to : [to],
			subject: subject,
			html: html
		});

		if (error) {
			logger.error(`Error while sending email - ${error.message}, ${to} ${subject}`);
			return {
				success: false,
				msg: error.message || 'Erro ao enviar email',
				error: error
			};
		}

		return {
			success: true,
			msg: 'Email enviado com sucesso',
			info: data
		};
	} catch (error) {
		logger.error(`Error in mailer: ${error.message} - Recipient: ${to}, Subject: ${subject}`);
		return {
			success: false,
			msg: error.message || 'Erro ao enviar email',
			error: error
		};
	}
};

module.exports = mailer;
