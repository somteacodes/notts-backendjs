import { schema, rules } from '@ioc:Adonis/Core/Validator';
import Env from '@ioc:Adonis/Core/Env';
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
// import Application from '@ioc:Adonis/Core/Application';
import Drive from '@ioc:Adonis/Core/Drive';
import Database from '@ioc:Adonis/Lucid/Database';
import { timeDiff } from 'Config/utils';
import dayjs from 'dayjs';
import User from 'App/Models/User';
import Mail from '@ioc:Adonis/Addons/Mail';
// import axios from 'axios';
// const axios = require('axios');

const accountSid = Env.get('TWILLO_ACCOUNT_SID');
const authToken = Env.get('TWILLO_AUTH_TOKEN');
const serviceId = Env.get('TWILLO_SERVICE_ID');
const client = require('twilio')(accountSid, authToken);

export default class UsersController {
  private pageCount() {
    return 12;
  }
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

  public async updateDetails({ auth, request, response }: HttpContextContract) {
    const user = await auth.user;
    if (!user) {
      response.unauthorized();
      return;
    }

    // sanitize post
    const updateSchema = schema.create({
      firstName: schema.string([rules.trim(), rules.escape()]),
      lastName: schema.string([rules.trim(), rules.escape()]),
      phone: schema.string.optional([rules.trim(), rules.escape()]),
      code: schema.string.optional([rules.trim(), rules.escape()]),
    });
    const payload = await request.validate({ schema: updateSchema });

    const details = await user.related('profile').query().first();
    if (!payload.phone || payload.phone == details?.phone) {
      //  NO NEED TO CHANGE, CHECK IF CODE
      response.ok({ message: 'No need to Change phone, just names' });
      await user
        .related('profile')
        .query()
        .update({ firstName: payload.firstName, lastName: payload.lastName });

      return;
    } else {
      // CHANGE PHONE, VERIFY CODE
      if (!payload.code) {
        response.badRequest();
        return;
      }
      // VERIFY CODE
      const verifyCode: string = await this.twilloCode(
        payload.phone.toString(),
        'verify',
        payload.code
      );
      if (verifyCode !== '') {
        response.badRequest({ message: 'code is wrong or has expired' });
        return;
      }
      await user
        .related('profile')
        .query()
        .update({ firstName: payload.firstName, lastName: payload.lastName, phone: payload.phone });
      response.ok({ message: 'done' });
      return;
    }
  }

  public async sendCodeToPhone({ auth, request, response }: HttpContextContract) {
    const user = await auth.user;
    if (!user) {
      response.unauthorized();
      return;
    }
    const payload = request.body();
    // create entries if non exists and send SMS
    const retries = await user
      .related('verificationRequest')
      .firstOrCreate({}, { userId: user.id, phoneTries: 1 });
    if (retries.$isLocal) {
      //  SEND SMS
      const sendSMS = await this.twilloCode(`+${payload.phone.trim()}`, 'request');
      response.ok({ retries, sendSMS, existing: false });
      return;
    } else {
      // existing db row, check time
      const duration = Math.round(Math.exp(retries.phoneTries!));
      const timeDifference = timeDiff(dayjs(), dayjs(retries.updatedAt.toString()), 'minute');
      if (timeDifference > duration) {
        // request SMS and increase retries
        const sendSMS = await this.twilloCode(`+${payload.phone.trim()}`, 'request');
        await user
          .related('verificationRequest')
          .updateOrCreate({}, { userId: user.id, phoneTries: retries.phoneTries! + 1 });
        response.ok({ retries, sendSMS, existing: true });
        return;
      } else {
        // notify user of time left
        response.ok({ retries, existing: true, timeLeft: duration });
        return;
      }
    }
  }
  public async verifyCodeFromPhone({ auth, request, response }: HttpContextContract) {
    const user = auth.user;
    if (!user) {
      response.unauthorized();
      return;
    }

    const payload = request.body();

    try {
      const verifySMS = await this.twilloCode(`+${payload.phone.trim()}`, 'verify', payload.code);
      response.ok(verifySMS);
      return;
    } catch (error) {
      response.internalServerError(error);
    }

    return;
  }

  public async getAllUsers({ auth, request, response }: HttpContextContract) {
    const user = await auth.user;

    await user?.refresh();
    await user?.load((loader) => {
      loader.load('role');
    });
    if (!user || user?.role?.name !== 'admin') {
      response.unauthorized();
      return;
    }
    const queryParams = request.qs();
    const { search, page = 1, sort = 'desc' } = queryParams;

    if (search) {
      response.ok(
        await this.Users()
          .andWhere('name', 'like', `%${search}%`)
          .orderBy('id', sort)
          .paginate(page, this.pageCount())
      );
      return;
    }
    response.ok(await this.Users().orderBy('id', sort).paginate(page, this.pageCount()));

    return;
  }

  public async sendEmail(){
    await Mail.send((message) => {
      message
        .from('noreply@email.notts.com.ng')
        .to('anunobisomto@gmail.com')
        .subject('Your Bank Change Verification Code')
        .htmlView('emails/requestCode', {
          verificationCode:"123456",
        });
    });
  }
  private async twilloCode(
    phone: string,
    type: 'request' | 'verify',
    code: string = ''
  ): Promise<string> {
    if (type === 'request') {
      return client.verify.v2
        .services(serviceId)
        .verifications.create({ to: phone, channel: 'sms' })
        .then((verification) => verification.status);
    } else {
      return client.verify.v2
        .services(serviceId)
        .verificationChecks.create({ to: phone, code })
        .then((verification_check) => verification_check.status);
    }
  }
  protected Users() {
    return User.query().preload('profile').preload('role');

    // .withAggregate('rewards', (query) => {
    //   query.count('*').as('rewards_count');
    // })
    // .withAggregate('donations', (query) => {
    //   query.count('*').as('donations_count');
    // })
    // .withAggregate('donations', (query) => {
    //   query.sum('amount').as('donated_total');
    // });
  }
}
