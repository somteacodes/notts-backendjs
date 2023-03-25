import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class VerificationRequest extends BaseModel {
  @column({ isPrimary: true, serializeAs:null })
  public id: number

  @column({ serializeAs: null })
  public userId: number;

  @column()
  public phoneTries: number|null;

  
  // @column.dateTime()
  // public phoneRequestAt: DateTime|null;

  @column.dateTime({ autoCreate: true})
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}

 