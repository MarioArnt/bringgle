import Email from 'email-templates'
import { UserDTO } from './models/user';
import Config from '../config'
import logger from './logger';

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
  public static sendListCreated = (listId: string, user: UserDTO) => {
    logger.info(`Preparing to sending email to ${user.email}.`)
    MailsController.emailOptions
    .send({
      template: 'create',
      message: {
        to: user.email
      },
      locals: {
        username: user.name,
        link: `${Config.baseURI}lists/${listId}`
      }
    })
    .then((mail: any) => {
      logger.info('Email sucessfully sent')
      logger.debug(mail)
    })
    .catch((err: any) => {
      logger.error(JSON.stringify)
      logger.error('Error sending mail')
    });
  }
}