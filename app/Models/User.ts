import { DateTime } from 'luxon';
import Hash from '@ioc:Adonis/Core/Hash';
import {
  column,
  beforeSave,
  BaseModel,
  hasOne,
  HasOne,
  belongsTo,
  BelongsTo,
  hasMany,
  HasMany,
} from '@ioc:Adonis/Lucid/Orm';
import Profile from 'App/Models/Profile';
import Role from './Role';
import Campaign from './Campaign';
import Donation from './Donation';
import Bank from './Bank';
import VerificationRequest from './VerificationRequest';
export default class User extends BaseModel {
  @column({ isPrimary: true, serializeAs: null })
  public id: number;

  @column({ serializeAs: null })
  public roleId: number;

  @column()
  public email: string;

  @column({ serializeAs: null })
  public password: string;

  @column({ serializeAs: null })
  public uuid: string | null;

  @column({ serializeAs: null })
  public rememberMeToken: string | null;

  @column.dateTime({serializeAs:null})
  public emailVerifiedAt: DateTime | null;

  @column()
  public verified: number | null;

  @column({ serializeAs: null })
  public verificationCode: string | null;

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
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

  @belongsTo(() => Role)
  public role: BelongsTo<typeof Role>;

  @hasMany(() => Campaign)
  public campaigns: HasMany<typeof Campaign>;

  @hasMany(() => Donation)
  public donations: HasMany<typeof Donation>;

  @hasOne(()=>Bank)
  public bank:HasOne<typeof Bank>

  @hasOne(()=>VerificationRequest)
  public verificationRequest:HasOne<typeof VerificationRequest>
}
