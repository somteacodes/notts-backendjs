import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import Application from '@ioc:Adonis/Core/Application';
import Drive from '@ioc:Adonis/Core/Drive'
export default class UsersController {
  public async index() {
    return 'Get Users';
  }

  public async uploadImage({ request, response }) {
 
    const userImage = request.file('user_image');
    if (userImage) { 
      await userImage.moveToDisk('./')
      const url = await Drive.getUrl(userImage.fileName)
      response.ok({url})
    }else{
      response.badRequest({ error:'An error occurred'})
    }
  }
}
