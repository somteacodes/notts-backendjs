import { DateTime } from 'luxon';
import { BaseModel, belongsTo, BelongsTo, column } from '@ioc:Adonis/Lucid/Orm';
import Category from './Category';

export default class Reward extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column({ serializeAs: null })
  public categoryId: number;

  @column()
  public name: string;

  @column()
  public target: number;

  @column()
  public description: string | null;

  @column()
  public image: string | null;

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

    // relationship
    @belongsTo(() => Category)
    public category: BelongsTo<typeof Category>;
}
