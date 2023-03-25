import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import DonationFactory from 'Database/factories/DonationFactory'

export default class extends BaseSeeder {
  public async run () {
    // Write your database queries inside the run method
    await DonationFactory.createMany(20)
  }
}
