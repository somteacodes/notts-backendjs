import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { schema } from '@ioc:Adonis/Core/Validator';
import Campaign from 'App/Models/Campaign';
export default class CampaignsController {
  public async createCampaign({ auth, request, response }: HttpContextContract) {
    const user = await auth.user;
    //  return user
    const newCampaignSchema = schema.create({
      name: schema.string(),
      category: schema.number(),
      amount: schema.number(),
      end_date: schema.string(),
      description: schema.string(),
    });
    const payload = await request.validate({ schema: newCampaignSchema });
    try {
     const newCampaign = await user?.related('campaign').create(payload)
     response.ok(newCampaign)
     return
    } catch (error) {
      response.badRequest(error)
    }
    
    
  }
}
