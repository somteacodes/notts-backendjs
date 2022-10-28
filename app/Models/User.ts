import { DateTime } from 'luxon';
import Hash from '@ioc:Adonis/Core/Hash';
import { column, beforeSave, BaseModel, hasOne, HasOne, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm';
import Profile from 'App/Models/Profile';
import Role from './Role';
export default class User extends BaseModel {
  @column({ isPrimary: true, serializeAs: null })
  public id: number;

  @column({ serializeAs: null })
  public roleId: number;

  @column()
  public email: string;

  @column({ serializeAs: null })
  public password: string;

  @column()
  public uuid?: string;

  @column()
  public rememberMeToken?: string | null;

  @column.dateTime()
  public emailVerifiedAt?: DateTime;

  @column()
  public verified?: number;

  @column({ serializeAs: null })
  public verificationCode?: string;

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true,serializeAs: null })
  public updatedAt: DateTime;

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password);
    }
  }
  // relationships
  @hasOne(() => Profile)
  public profile: HasOne<typeof Profile>;

  @belongsTo(()=>Role)
  public role:BelongsTo<typeof Role>
}
