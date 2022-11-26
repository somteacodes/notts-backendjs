import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('role_id').unsigned().references('roles.id').defaultTo(2)
      table.string('email',180).notNullable().unique()
      table.string('password',180).nullable()
      table.string('remember_me_token').nullable()
      table.string('uuid').nullable()
      table.string('verification_code').nullable()
      table.timestamp('email_verified_at').nullable()
      table.boolean('verified').defaultTo(false)

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
