import  User  from 'App/Models/User';
import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'

export default class Profile extends BaseModel {
  @column({ isPrimary: true, serializeAs: null})
  public id: number

  @column({ serializeAs: null})
  public userId:number

  @column()
  public firstName:string

  @column()
  public lastName?:string

  @column()
  public phone?:string

  @column()
  public image?:string

  @column.dateTime()
  public dob?:DateTime

  @column.dateTime({ autoCreate: true, serializeAs: null})
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

    // relationships
   @belongsTo(()=>User)
    public user:BelongsTo<typeof User>
}
