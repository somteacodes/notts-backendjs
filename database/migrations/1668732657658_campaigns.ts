import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class extends BaseSchema {
  protected tableName = 'campaigns';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary();
      table.integer('user_id').references('users.id');
      table.integer('category_id').references('categories.id');
      table.string('name');
      // table.string('cid').unique();
      table.string('slug',180).unique()
      table.integer('amount');
      table.string('end_date');
      table.text('description');
      table.string('image').nullable();
      table.boolean('verified').defaultTo(false).nullable();
      table.boolean('featured').defaultTo(false).nullable();

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
