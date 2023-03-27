import Env from '@ioc:Adonis/Core/Env';
import { schema, rules } from '@ioc:Adonis/Core/Validator';
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import Campaign from 'App/Models/Campaign';
import Donation from 'App/Models/Donation';
import User from 'App/Models/User';
import axios from 'axios';

export default class DonationsController {
  private async verifyDonation(paymentRef: string) {
    const { data } = await axios.get(`${Env.get('PAYSTACK_VERIFY_URL')}${paymentRef}`, {
      headers: { Authorization: `Bearer ${Env.get('PAYSTACK_SECRET_TEST_KEY')}` },
    });
    return data;
  }
  public async saveDonation({ auth, request, response }: HttpContextContract) {
    const user = auth.user!;
    if (!user) {
      response.unauthorized({ message: 'You need to be logged in' });
      return;
    }
    const saveDonationSchema = schema.create({
      campaign: schema.string([rules.trim()]),
      donatedAmount: schema.number(),
      owner: schema.string([rules.trim()]),
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

    try {
      const paymentData = await this.verifyDonation(payload.paymentRef);
      if (!paymentData.status) {
        response.badRequest({ message: 'Payment failed' });
        return;
      }

      const ownerDetails = await User.findByOrFail('email', payload.owner);
      const campaign = await Campaign.findByOrFail('slug', payload.campaign);

      const payloadData = {
        campaign_id: campaign.id!,
        user_id: user.id,
        owner_id: ownerDetails.id!,
        reward_id: payload.reward ?? null,
        amount: payload.donatedAmount,
        payment_ref: payload.paymentRef,
        payment_channel: payload.paymentChannel,
        claimed_reward: 0,
      };
      await Donation.create(payloadData);
      response.ok({ message:'Donation successful'});
      return;
    } catch (error) {
      response.badGateway({ message: 'An error occurred, please contact support' });
      return;
    }
  }
}
