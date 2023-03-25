import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import CampaignFactory from 'Database/factories/CampaignFactory'

export default class extends BaseSeeder {
  public async run () {
    // Write your database queries inside the run method
    // await CampaignFactory
    // .with('rewards', Math.floor(Math.random() * 5) + 1)
    // .createMany(20)
  }
}
