import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { schema, rules } from '@ioc:Adonis/Core/Validator';
import Mail from '@ioc:Adonis/Addons/Mail';
import User from 'App/Models/User';
import { DateTime } from 'luxon';
export default class AuthController {
  public async register({
    ally,
    auth,
    request,
    response,
    params: { provider },
  }: HttpContextContract) {
    if (provider === 'email') {
      const newAuthSchema = schema.create({
        email: schema.string({ trim: true }, [rules.email()]),
        password: schema.string({}, [rules.minLength(4)]),
      });
      const payload = await request.validate({ schema: newAuthSchema });
      const user = await User.create(payload);
      await user.related('profile').firstOrCreate({
        firstName: payload.email.split('@')[0],
      });
      await this.sendCodeToEmail(payload.email);
      const { token } = await this.generateUserWithToken(auth, user);
      
      await user.refresh();
      await user.load((loader) => {
        loader.load('profile').load('role');
      });
      response.status(201);
      return { user, token };
    }

    if (provider === 'google') {
      const { access_token } = request.body();

      const userFromGoogle = await ally.use('google').userFromToken(access_token);

      const user = await User.firstOrCreate(
        { email: userFromGoogle.email! },
        { emailVerifiedAt: DateTime.now(), verified: 1 }
      );

      await user.related('profile').firstOrCreate({
        firstName: (await this.splitName(userFromGoogle.name)).firstName,
        lastName: (await this.splitName(userFromGoogle.name)).lastName,
        image: userFromGoogle.avatarUrl!,
      });
      const { token } = await this.generateUserWithToken(auth, user);
     
      await user.refresh();
      await user.load((loader) => {
        loader.load('profile').load('role');
      });
      response.status(201);
      return { user, token };
    }
  }
  public async login() {
    return 'login user';
  }

  async sendCodeToEmail(email) {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      {
        data: email,
      },
      'notts2022@!',
      { expiresIn: '6h' }
    );
    await Mail.sendLater((message) => {
      message
        .from('noreply@notts.com.ng')
        .to(email)
        .subject('Verify your account')
        .htmlView('emails/verify', {
          url: `https//www.notts.com.ng/verify/?token=${token}`,
        });
    });
  }

  async generateUserWithToken(auth, user) {
    return await auth.use('api').generate(user);
  }
  async splitName(name = '') {
    const [firstName, ...lastName] = name.split(' ').filter(Boolean);
    return {
      firstName: firstName,
      lastName: lastName.join(' '),
    };
  }
}
