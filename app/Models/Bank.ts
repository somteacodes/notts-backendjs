import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Bank extends BaseModel {
  @column({ isPrimary: true, serializeAs:null })
  public id: number

  @column({ serializeAs: null })
  public userId: number;

  @column()
  public bankName:string

  @column()
  public accountNumber:string

  @column()
  public accountName:string

  @column()
  public otp:string|null

  @column()
  public otpRequestTime:string|null

  @column.dateTime({ autoCreate: true, serializeAs:null })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs:null })
  public updatedAt: DateTime
}
