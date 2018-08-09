import Email from 'email-templates';
import Config from '../config';
import logger from './logger';
import Errors, {ErrorModel} from './constants/errors';

export default class MailsController {
	private static readonly emailOptions = new Email({
		message: {
			from: Config.email.from
		},
		send: true,
		transport: {
			jsonTransport: true
		}
	});
	public static sendListCreated = (listId: string, listName: string, userName: string, userEmail: string) => {
		logger.info(`Preparing to sending email to ${userEmail}.`);
		MailsController.emailOptions
		.send({
			template: 'create',
			message: {
				to: userEmail
			},
			locals: {
				username: userName,
				listname: listName,
				link: `${Config.protocole}://${Config.baseURI}/#/list/${listId}`
			}
		})
		.then(() => {
			logger.info('Email sucessfully sent');
		})
		.catch(() => {
			logger.error('Error sending mail');
		});
	};
	public static invite = async (listId: string, listName: string, email: string, invitedBy: string): Promise<void> => {
		MailsController.emailOptions
		.send({
			template: 'invite',
			message: {
				to: email
			},
			locals: {
				username: invitedBy,
				listname: listName,
				link: `${Config.protocole}://${Config.baseURI}/#/list/${listId}`
			}
		})
		.then(() => {
			return Promise.resolve();
		})
		.catch((err: any) => {
			const formattedError: ErrorModel = Errors.emailNotSent(err);
			return Promise.reject(formattedError);
		});
	};
}
