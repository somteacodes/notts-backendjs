import Env from '@ioc:Adonis/Core/Env';
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
    let user;
    if (provider === 'email') {
      const newAuthSchema = schema.create({
        email: schema.string({ trim: true }, [rules.email()]),
        password: schema.string({}, [rules.minLength(4)]),
      });
      const payload = await request.validate({ schema: newAuthSchema });
      try {
        user = await User.create(payload);
      } catch {
        response.badRequest({ error: 'Email already registered' });
        return;
      }

      await user.related('profile').firstOrCreate({
        firstName: payload.email.split('@')[0],
      });
      await this.sendCodeToEmail(payload.email);
    }

    if (provider === 'google') {
      const { access_token } = request.body();
      try {
        user = await this.authWithGoogle(ally, access_token);
      } catch {
        response.badRequest({ error: 'An error occurred, please try again' });
        return;
      }
    }

    const { token } = await this.generateUserWithToken(auth, user);

    await user.refresh();
    await user.load((loader) => {
      loader.load('profile').load('role');
    });
    response.created({ user, token });
  }
  public async login({ ally, auth, request, response, params: { provider } }) {
    let user;
    if (provider === 'email') {
      const newAuthSchema = schema.create({
        email: schema.string({ trim: true }, [rules.email()]),
        password: schema.string({}, [rules.minLength(4)]),
      });
      const payload = await request.validate({ schema: newAuthSchema });
      try {
        const { token } = await auth.use('api').attempt(payload.email, payload.password);

        user = await User.findBy('email', payload.email);
        await user.refresh();
        await user.load((loader) => {
          loader.load('profile').load('role');
        });

        response.ok({ user, token });
      } catch {
        response.badRequest({ error: 'Invalid login credentials.' });
      }
    }
    if (provider === 'google') {
      const { access_token } = request.body();
      try {
        user = await this.authWithGoogle(ally, access_token);
      } catch {
        response.badRequest({ error: 'Any error occurred, please try again.' });
        return;
      }
      const { token } = await this.generateUserWithToken(auth, user);
      await user.refresh();
      await user.load((loader) => {
        loader.load('profile').load('role');
      });
      response.ok({ user, token });
    }
  }

  public async verifyCodeFromEmail({ request, response }) {
    const jwt = require('jsonwebtoken');
    const { code } = request.body();

    try {
      const { data } = await jwt.verify(code,Env.get('JWT_SECRET'));
      const user = await User.findBy('email', data);
      if(user){
        user.verified = 1;
        await user.save();
        response.ok({ message: 'email has been verified' });
        return
      }else{
        response.badRequest({ error: 'Wrong code or code has expired' });
        return;
      }

    } catch (error) {

      response.badRequest({ error: 'Wrong code or code has expired' });
      return;
    }
  }

  public async requestVerification({auth, response }) {
    const user = await auth.user
    try {
      await this.sendCodeToEmail(user.email);
      response.ok({ message: 'Validation link sent to your email' });
    } catch (error) {
      response.badRequest({ error });
    }
  }
 private async sendCodeToEmail(email) {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      {
        data: email,
      },
      Env.get('JWT_SECRET'),
      { expiresIn:Env.get('JWT_EXPIRY') }
    );
    await Mail.sendLater((message) => {
      message
        .from('noreply@email.notts.com.ng')
        .to(email)
        .subject('Verify your account')
        .htmlView('emails/verify', {
          url: `${Env.get('FRONTEND_URL')}/verify?token=${token}`,
        });
    });
  }

  private async generateUserWithToken(auth, user) {
    return await auth.use('api').generate(user);
  }

 private  async authWithGoogle(ally, access_token:string) {
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

    return user;
  }
  private async splitName(name = '') {
    const [firstName, ...lastName] = name.split(' ').filter(Boolean);
    return {
      firstName,
      lastName: lastName.join(' '),
    };
  }
}
