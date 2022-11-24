import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import Drive from '@ioc:Adonis/Core/Drive';
import Campaign from 'App/Models/Campaign';

export default class RewardsController {
  public async createReward({ auth, request, response }: HttpContextContract) {
    const user = await auth.user;
    if (!user) {
      response.unauthorized({ message: 'You need to be logged in' });
      return;
    }

    const requestBody = request.body();
    let url=""

    if (request.file('reward_image')) {
      const rewardImage = request.file('reward_image', {
        size: '10mb',
        extnames: ['jpg', 'png', 'gif'],
      });
      if (!rewardImage?.isValid) {
        response.badRequest(rewardImage?.errors[0].message);
        return;
      }
      await rewardImage.moveToDisk('./', {}, 's3');
      url = await Drive.getUrl(rewardImage.fileName || '');
    } 

    try {
      // find campaign
      const campaign = await Campaign.query()
        .where('slug', requestBody.slug)
        .andWhere('user_id', user.id)
        .firstOrFail();

      await campaign.related('rewards').create({
        name: requestBody.name,
        description: requestBody.description,
        target: parseInt(requestBody.target),
        image: url,
      });

      //  TODO, reutn campaign or just rewards

      response.ok({ campaign });
    } catch (errors) {
      response.badRequest({ error: errors });
    }
  }

  public async getRewards({ request, response}: HttpContextContract){
    // const requestBody = request.body();
    const params = request.params();
    const campaign = await Campaign.query()
    .where('slug', params.slug) 
    .firstOrFail();

    const rewards = await campaign.related('rewards').query()
   response.ok(rewards);
  }
}
