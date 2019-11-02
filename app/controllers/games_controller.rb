class GamesController < ApplicationController
  before_action :set_game, only: [:update]

  def index
    @games = Game.order(:created_at)
  end

  def update
    # there are no checks whether any game is overbooked or not
    # there should be one check on the database level,
    # and another check on the ActiveRecond level (e.g. minutes_booked <= 90)
    @game.update(games_params)
    @game.save

    respond_to do |format|
      format.js
    end
  end

  private

    def set_game
      @game = Game.find(params[:id])
    end

    def games_params
      params.require(:game).permit(:minutes_booked)
    end
end
