import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
// import Application from '@ioc:Adonis/Core/Application';
import Drive from '@ioc:Adonis/Core/Drive';
import Database from '@ioc:Adonis/Lucid/Database';

export default class UsersController {
  public async index() {
    return 'Get Users';
  }

  public async uploadImage({ auth, request, response }: HttpContextContract) {
    const user = await auth.user;
    if (!user) {
      response.unauthorized({ message: 'You need to be logged in' });
      return;
    }

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
      const url = await Drive.getUrl(userImage.fileName || '');
      await user.related('profile').query().update({ image: url });
      response.ok({ url });
    } catch (error) {
      response.badRequest({ error });
    }
  }

  public async getUserCampaignStats({ auth, response }: HttpContextContract) {
    let loggedUser = await auth.user;
    const verfiedCampaigns = await Database.from('campaigns')
      .where('user_id', '=', loggedUser?.id || 0)
      .where('verified', '=', 1)
      .count('* as verified')
      // .sum('amount as donated')
      .firstOrFail();
    const unverfiedCampaigns = await Database.from('campaigns')
      .where('user_id', '=', loggedUser?.id || 0)
      .where('verified', '=', 0)
      .count('* as unverified')
      // .sum('amount as donated')
      .firstOrFail();

    response.ok({ ...verfiedCampaigns, ...unverfiedCampaigns });
    return;
  }
  public async getUserDonationStats({ auth, response }: HttpContextContract) {
    const loggedUser = await auth.user;

    const supportedDetail = await Database.from('donations')
      .where('user_id', '=', loggedUser?.id || 0)
      .count('* as supporting')
      .sum('amount as donated')
      .firstOrFail();

    const supportingDetail = await Database.from('donations')
      .where('owner_id', '=', loggedUser?.id || 0)
      .count('* as supported')
      .sum('amount as received')
      .firstOrFail();
    response.ok({ ...supportedDetail, ...supportingDetail });
  }

  public async getUserBankDetail({ auth, response }: HttpContextContract) {
    const loggedUser = await auth.user;

    const bankDetails = await loggedUser?.related('bank').query().firstOrFail();
    response.ok(
      bankDetails?.serialize({
        fields: {
          pick: ['account_number', 'account_name', 'bank_name'],
        },
      })
    );
    return;
  }
}
