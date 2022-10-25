import { DateTime } from 'luxon'
import { BaseModel, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import User from './User'

export default class Role extends BaseModel {
  @column({ isPrimary: true ,serializeAs: null})
  public id: number

  @column()
  public name:string

  @column.dateTime({ autoCreate: true, serializeAs: null})
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true,serializeAs: null })
  public updatedAt: DateTime

    // relationships
    @hasMany(() => User)
    public profile: HasMany<typeof User>;
}
