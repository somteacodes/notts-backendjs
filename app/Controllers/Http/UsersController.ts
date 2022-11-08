import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import Application from '@ioc:Adonis/Core/Application';
import Drive from '@ioc:Adonis/Core/Drive';

export default class UsersController {
  public async index() {
    return 'Get Users';
  }

  public async uploadImage({ request, response }) {
    // TODO get username from auth access token
    const userImage = request.file('user_image', {
      size: '10mb',
      extnames: ['jpg', 'png', 'gif'],
    });
    if (!userImage?.isValid) {
      response.badRequest(userImage?.errors[0].message);
      return;
    }

    try {
      await userImage.moveToDisk('./', {}, 's3');
      const url = await Drive.getUrl(userImage.fileName);
      response.ok({ url });
    } catch (error) {
      response.badRequest({ error });
    }
  }
}
