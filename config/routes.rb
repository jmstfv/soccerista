Rails.application.routes.draw do
  root 'games#index'
  resources :games, only: [:index, :update]
end
