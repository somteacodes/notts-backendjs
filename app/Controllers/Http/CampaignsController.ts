import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { schema } from '@ioc:Adonis/Core/Validator';
import Drive from '@ioc:Adonis/Core/Drive';
import Campaign from 'App/Models/Campaign';
import User from 'App/Models/User';
export default class CampaignsController {
  public pageCount() {
    return 9;
  }
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
      const newCampaign = await user?.related('campaigns').create(payload);
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
      .preload('rewards')
      .preload('user', (pq) => {
        pq.preload('profile');
      })
      .withAggregate('rewards', (query) => {
        query.count('*').as('rewards_count');
      })
      .withAggregate('donations', (query) => {
        query.count('*').as('donations_count');
      })
      .withAggregate('donations', (query) => {
        query.sum('amount').as('donated_total');
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
  public async getCampaignsByType({ response, params: { type = 'all' } }: HttpContextContract) {
    if (type === 'featured') {
      const campaigns = await this.Campaigns()
        .andWhere('featured', true)
        .orderBy('id', 'desc')
        .paginate(1, this.pageCount());

      response.ok(campaigns);
      return;
    }
    if (type === 'trending') {
      const campaigns = await this.Campaigns().orderBy('id', 'desc').paginate(1, this.pageCount());
      response.ok(campaigns);
      return;
    }
    const campaigns = {};
    response.ok(campaigns);
    return;
  }

  public async getAllCampaigns({ response, request }: HttpContextContract) {
    const queryParams = request.qs();
    const { search, page = 1, category, sort = 'desc' } = queryParams;

    if (search) {
      response.ok(
        await this.Campaigns()
          .andWhere('name', 'like', `%${search}%`)
          .orderBy('id', sort)
          .paginate(page, this.pageCount())
      );
      return;
    }
    if (category) {
      response.ok(
        await this.Campaigns()
          .andWhereHas('category', (q) => {
            q.where('id', category);
          })
          .orderBy('id', sort)
          .paginate(page, this.pageCount())
      );
      return;
    }
    response.ok(
      await this.Campaigns()

        .orderBy('id', sort)
        .paginate(page, this.pageCount())
    );
    return;
  }

  public async getAllMyCampaigns({ auth, request, response }) {
    const queryParams = request.qs();
    const { search, page = 1, sort = 'desc' } = queryParams;

    const user: User = await auth.user;

    if (!user) {
      response.ok();
      return;
    }
    if (search) {
      response.ok(
        await this.Campaigns()
          .andWhere('user_id', '=', user.id)
          .andWhere('name', 'like', `%${search}%`)
          .orderBy('id', sort)
          .paginate(page, this.pageCount())
      );
      return;
    }
    response.ok(
      await this.Campaigns()
        .andWhere('user_id', '=', user.id)
        .orderBy('id', sort)
        .paginate(page, this.pageCount())
    );
    return;
  }

  public async getCampaignBySlug({ request, response }: HttpContextContract) {
    const { slug } = request.params();
    const campaign = await this.Campaigns()
      .andWhere('slug', slug)
      .preload('donations', (donationsQuery) => {
        donationsQuery
          .preload('user', (userQuery) => {
            userQuery.preload('profile');
          })
          .orderBy('id', 'desc')
          .limit(3);
      })
      .first();
    response.ok(campaign);
  }

  protected Campaigns() {
    return Campaign.query()
      .andWhere('verified', true)
      .preload('category')
      .preload('rewards')
      .preload('user', (pq) => {
        pq.preload('profile');
      })

      .withAggregate('rewards', (query) => {
        query.count('*').as('rewards_count');
      })
      .withAggregate('donations', (query) => {
        query.count('*').as('donations_count');
      })
      .withAggregate('donations', (query) => {
        query.sum('amount').as('donated_total');
      });
  }
}
