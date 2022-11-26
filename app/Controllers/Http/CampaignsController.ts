import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { schema } from '@ioc:Adonis/Core/Validator';
import Drive from '@ioc:Adonis/Core/Drive';
import Campaign from 'App/Models/Campaign';
export default class CampaignsController {
  public async createCampaign({ auth, request, response }: HttpContextContract) {
    const user = await auth.user;
    if (!user) {
      response.unauthorized({ message: 'You need to be logged in' });
      return;
    }
    const newCampaignSchema = schema.create({
      name: schema.string(),
      category_id: schema.number(),
      amount: schema.number(),
      end_date: schema.string(),
      description: schema.string(),
    });
    const payload = await request.validate({ schema: newCampaignSchema });
    try {
      const newCampaign = await user?.related('campaign').create(payload);
      response.ok(newCampaign);
      return;
    } catch (error) {
      response.badRequest(error);
    }
  }

  public async viewMyCampaign({ auth, request, response }: HttpContextContract) {
    const user = await auth.user;

    if (!user) {
      response.unauthorized({ message: 'You need to be logged in' });
      return;
    }
    const params = request.params();
    // return params;

    const campaign = await Campaign.query()
      .where('slug', params.slug)
      .withCount('rewards')
      // .andWhere('user_id', user.id)
      .preload('category')
      .preload('user', (pq) => {
        pq.preload('profile');
      })
      .withAggregate('rewards', (query) => {
        query.count('*').as('rewards_count')
      })
      .withAggregate('donations', (query) => {
        query.count('*').as('donations_count')
      }) 
      .firstOrFail();

      // await campaign.loadCount('rewards')
 
    // campaign?.related('user');
    campaign.user.email === user.email
      ? response.ok(campaign)
      : response.forbidden({ message: 'You do not have permission to view this campaign' });

    // return campaign;
  }

  public async uploadImage({ auth, request, response }: HttpContextContract) {
    const user = await auth.user;
    if (!user) {
      response.unauthorized({ message: 'You need to be logged in' });
      return;
    }
    const requestBody = request.body();
    const campaign = await Campaign.query()
      .where('slug', requestBody.slug)
      .andWhere('user_id', user.id)
      .firstOrFail();

    const campaignImage = request.file('user_image', {
      size: '10mb',
      extnames: ['jpg', 'png', 'gif'],
    });
    if (!campaignImage?.isValid) {
      response.badRequest(campaignImage?.errors[0].message);
      return;
    }

    try {
      await campaignImage.moveToDisk('./', {}, 's3');
      const url = await Drive.getUrl(campaignImage.fileName || '');
      campaign.image = url;
      await campaign.save();
      response.ok({ url });
    } catch (error) {
      response.badRequest({ error });
    }
  }


  public async getFeaturedCampaigns({ response}:HttpContextContract){

    const campaigns = await Campaign.query()
    .withCount('rewards')
    .andWhere('verified',true)
    .andWhere('featured',true)
    .preload('category')
    .preload('user', (pq) => {
      pq.preload('profile');
    })
    .withAggregate('rewards', (query) => {
      query.count('*').as('rewards_count')
    })
    .withAggregate('donations', (query) => {
      query.count('*').as('donations_count')
    })
    .orderBy('id', 'desc')
    .limit(10)

    response.ok(campaigns)
  }
}
