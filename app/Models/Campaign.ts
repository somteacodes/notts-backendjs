import { DateTime } from 'luxon';
import { BaseModel, beforeSave, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm';
import Category from './Category';
import User from './User';
import { slugify } from '@ioc:Adonis/Addons/LucidSlugify';

export default class Campaign extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public userId: number;

  @column()
  public categoryId: number;

  @column()
  public name: string;
  
  @column()
  @slugify({
    strategy: 'dbIncrement',
    fields: ['name']
  })
  public slug: string

  // @column()
  // public cid: string;

  @column()
  public amount: number;

  @column()
  public endDate: DateTime;

  @column()
  public description: string | null;

  @column()
  public image: string | null;

  @column({ serializeAs: null })
  public verified: number | null;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null})
  public updatedAt: DateTime;

  // relationship
  @belongsTo(() => Category)
  public category: BelongsTo<typeof Category>;
 
  @belongsTo(() => User)
  public user: BelongsTo<typeof User>;


  // @beforeSave()
  // public static async changeToDate(campaign:Campaign){
  //   if(campaign.$dirty.endDate){
  //     campaign.endDate= campaign.endDate
  //   }
  // }
}