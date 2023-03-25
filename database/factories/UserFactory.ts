import User from 'App/Models/User'
import Factory from '@ioc:Adonis/Lucid/Factory'
import ProfileFactory from './ProfileFactory'
import CampaignFactory from './CampaignFactory'

export default Factory.define(User, ({ faker }) => {
  return {
    //
    roleId: 3,
    email: faker.internet.email(),
    password: 'password',
    verified: 1,


  }
})
.relation('profile', () => ProfileFactory )
.relation('campaigns', () => CampaignFactory)
.build()
