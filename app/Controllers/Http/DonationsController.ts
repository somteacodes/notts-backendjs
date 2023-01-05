import { schema, rules } from '@ioc:Adonis/Core/Validator';
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import Campaign from 'App/Models/Campaign';
import Donation from 'App/Models/Donation';
import User from 'App/Models/User';

export default class DonationsController {
  public async saveDonation({ auth, request, response }: HttpContextContract) {
    const user = await auth.user;
    if (!user) {
      response.unauthorized({ message: 'You need to be logged in' });
      return;
    }

    // return request.body()

    const saveDonationSchema = schema.create({
      campaign: schema.string([rules.trim()]),
      donatedAmount: schema.number(),
      owner:schema.string([rules.trim()]),
      donator: schema.string([rules.trim()]),
      paymentRef: schema.string([rules.trim()]),
      paymentChannel: schema.string.nullableAndOptional([rules.trim()]),
      reward: schema.number.nullableAndOptional(),
    });
    const payload = await request.validate({ schema: saveDonationSchema });
    if (payload.donator !== user.email) {
      response.forbidden('Login to your account to make a donation');
      return;
    }
    const ownerDetails = await User.findByOrFail('email', payload.owner);
    // get campaign ID
    const campaign = await Campaign.findBy('slug', payload.campaign);

    const data = {
      campaign_id: campaign?.id,
      user_id: user.id,
      owner_id:ownerDetails.id,
      reward_id: payload.reward || null,
      amount: payload.donatedAmount,
      payment_ref: payload.paymentRef,
      payment_channel: payload.paymentChannel,
      claimed_reward: 0,
    };
    try {
      await Donation.create(data);
      response.ok({slug:campaign?.slug});
      return;
    } catch (error) {
      response.badGateway({message:'An error occured, please contact support'});
      return;
    }
  }
}
