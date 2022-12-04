import { DateTime } from 'luxon'
import { BaseModel, belongsTo, BelongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Campaign from './Campaign';
import User from './User';

export default class Donation extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({ serializeAs: null })
  public campaignId: number;

  @column({ serializeAs: null })
  public userId: number;

  @column({ serializeAs: null })
  public rewardId: number|null;

  @column()
  public amount: number;

  @column()
  public claimed_reward: number|null;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  // relationship
  @belongsTo(()=>User)
  public user:BelongsTo<typeof User>

  @belongsTo(()=>Campaign)
  public campaign:BelongsTo<typeof Campaign>
}
