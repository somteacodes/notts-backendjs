import { DateTime } from 'luxon';
import {
  BaseModel,
  BelongsTo,
  belongsTo,
  column,
  HasMany,
  hasMany,
} from '@ioc:Adonis/Lucid/Orm';
import Category from './Category';
import User from './User';
import { slugify } from '@ioc:Adonis/Addons/LucidSlugify';
import Reward from './Reward';
import Donation from './Donation';

export default class Campaign extends BaseModel {
  public serializeExtras = true
  @column({ isPrimary: true })
  public id: number;

  @column({ serializeAs: null })
  public userId: number;

  @column({ serializeAs: null })
  public categoryId: number;

  @column()
  public name: string;

  @column()
  @slugify({
    strategy: 'dbIncrement',
    fields: ['name'],
  })
  public slug: string;

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

  @column()
  public verified: number | null;

  @column()
  public featured: number | null;


  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  public updatedAt: DateTime;

  // relationship
  @belongsTo(() => Category)
  public category: BelongsTo<typeof Category>;

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>;

  @hasMany(() => Reward)
  public rewards: HasMany<typeof Reward>;


  @hasMany(() => Donation)
  public donations: HasMany<typeof Donation>;

  
  // @beforeSave()
  // public static async changeToDate(campaign:Campaign){
  //   if(campaign.$dirty.endDate){
  //     campaign.endDate= campaign.endDate
  //   }
  // }
}
