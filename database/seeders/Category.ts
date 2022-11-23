import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Category from 'App/Models/Category'

export default class extends BaseSeeder {
  public async run () {
    // Write your database queries inside the run method
    await Category.createMany([
      { name: "Other", image: "" }, 
      { name: "Fashion", image: "https://i.ibb.co/Bz4kYqb/fashion.png" },
      { name: "Music", image: "https://i.ibb.co/rMcCqxF/music.png" },
      { name: "Travel", image: "https://i.ibb.co/Twc1FtY/travel.png" },
      { name: "Computer", image: "https://i.ibb.co/sygtHpB/computer.png" },
      { name: "Creative", image: "https://i.ibb.co/YbbQ1NG/creative.png" },
      { name: "Education", image: "https://i.ibb.co/mJZJcw7/education.png" },
    ])

  }
}
