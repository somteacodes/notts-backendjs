import BaseSeeder from '@ioc:Adonis/Lucid/Seeder';
import UserFactory from 'Database/factories/UserFactory';

export default class extends BaseSeeder {
  public async run() {
    // Write your database queries inside the run method
    await UserFactory.merge([
      { roleId: 1, email: 'admin@email.com', password: 'password', verified: 1 },
      { roleId: 2, email: 'manager@email.com', password: 'password', verified: 1 },
      { roleId: 3, email: 'user@email.com', password: 'password', verified: 1 },
    ])
      .with('profile', 1)
      .with('campaigns', Math.floor(Math.random()*5) + 1,
      (campaign) => {
        campaign
        .with('rewards', Math.floor(Math.random() * 3) + 1)

    }
      )
      .createMany(10);
  }
}
