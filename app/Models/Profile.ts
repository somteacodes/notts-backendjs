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
  public lastName:string|null

  @column()
  public phone:string|null

  @column()
  public image:string|null

  @column.dateTime()
  public dob?:DateTime

  @column.dateTime({ autoCreate: true, serializeAs: null})
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true,serializeAs: null })
  public updatedAt: DateTime

    // relationships
   @belongsTo(()=>User)
    public user:BelongsTo<typeof User>
}
