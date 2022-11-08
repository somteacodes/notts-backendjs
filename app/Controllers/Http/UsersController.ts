import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import Application from '@ioc:Adonis/Core/Application';
import Drive from '@ioc:Adonis/Core/Drive';
 
export default class UsersController {
  public async index() {
    return 'Get Users';
  }

  public async uploadImage({ request, response }) {
    // TODO get username from auth access token
    const userImage = request.file('user_image');

    try {
      await userImage.moveToDisk('./', {  
      }, 's3');
      const url = await Drive.getUrl(userImage.fileName);
      response.ok({ url });
    } catch (error) {
      response.badRequest({error});
    }
    
  }

   
}
