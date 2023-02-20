import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'banks'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.string('bank_name').notNullable()
      table.string('account_number').notNullable()
      table.string('account_name').notNullable()
      table.string('otp').nullable()
      table.string('otp_request_time').nullable()
      table.timestamps(true, true)
      })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
