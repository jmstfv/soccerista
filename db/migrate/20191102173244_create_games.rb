class CreateGames < ActiveRecord::Migration[5.2]
  def change
    create_table :games do |t|
      t.datetime :game_time, null: false
      t.string :title, null: false
      t.string :home_team_logo, null: false
      t.string :away_team_logo, null: false
      t.string :league, null: false
      t.string :channel, null: false
      t.integer :reach, null: false
      t.integer :price_per_minute, null: false
      t.integer :minutes_booked, null: false

      t.timestamps
    end
  end
end
