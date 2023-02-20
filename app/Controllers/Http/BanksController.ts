import dayjs from 'dayjs';
import { generateOTP, timeDiff } from './../../../config/utils';
import Mail from '@ioc:Adonis/Addons/Mail';
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { getPossibleBanks } from 'Config/nuban';
import Bank from 'App/Models/Bank';

export default class BanksController {
 
  public async updateBankDetails({ auth, request, response }: HttpContextContract) {
    const user = await auth.user;
    if (!user) {
      response.unauthorized();
      return;
    }
    const payload = request.body();
    const getOtp: Bank = await user.related('bank').query().firstOrFail();
    if (getOtp.otp !== payload.verificationCode) {
      response.abort({ message: 'Code is invalid, check your email for your verification code' });
      return;
    }
    if (timeDiff(dayjs(), dayjs(getOtp.otpRequestTime), 'minutes') > 5) {
      response.abort({ message: 'Code has expired, request a new one' });
      return;
    }

    const updatePayload: Partial<Bank> = {
      bankName: payload.accountBankName,
      accountName: payload.accountName,
      accountNumber: payload.accountNumber,
    };
    await user.related('bank').updateOrCreate({}, updatePayload);
    response.ok({message:"Bank details updated"})
    return
  }

  public async getBanks({ request, response }: HttpContextContract): Promise<void> {
    const { nuban } = request.params();
    response.ok(await getPossibleBanks(nuban));
  }

  public async getBankVerificationCode({
    auth, 
    response,
  }: HttpContextContract): Promise<void> {
    const user = await auth.user;

    if (!user) {
      response.unauthorized();
      return;
    }
    const verificationCode = generateOTP(6);

    const updatePayload: Partial<Bank> = {
      otp: verificationCode,
      otpRequestTime: dayjs().toString(),
    };
    await user.related('bank').updateOrCreate({}, updatePayload);

    await Mail.sendLater((message) => {
      message
        .from('noreply@notts.com.ng')
        .to(user!.email)
        .subject('Your Bank Change Verification Code')
        .htmlView('emails/requestCode', {
          verificationCode,
        });
    });
    // TODO SEND EMAIL
    // TODO Send code to datbase
    response.ok({ message: 'code requested' });
    return;
  }
}
