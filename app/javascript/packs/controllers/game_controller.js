'use strict';

import { Controller } from "stimulus"

export default class extends Controller {
  static targets = [ "minutesBooked" ]

  initialize() {
    this.calculateFinalPrice();
  }

  // lots of duplication between .increment and .decrement, DRY it out!
  increment(event) {
    let minutesBooked = 0;
    let minutesBookedElement = null;

    this.minutesBookedTargets.forEach((element, _index) => {
      // storing data on the parent element so that actions and targets could get access to it
      if (element.parentNode.dataset.gameId == event.currentTarget.parentNode.dataset.gameId) {
        minutesBooked = parseInt(element.textContent) + 1;
        minutesBookedElement = element;
      }
    });

    // this should be checked on the ActiveRecord and the database level
    if (minutesBooked > 90) return;

    const formData = new FormData();
    formData.append("game[minutes_booked]", minutesBooked);

    // storing data on the parent element to avoid duplication
    this.sendData(event.currentTarget.parentNode.dataset.updateUrl, formData);
    /*
    * this is the most naïve way of displaying a number of minutes booked
    *
    * this will fly out of the window if someone (or something) else
    * will modify the value in the interim (think race condition)
    *
    * a slightly better way of doing it would be to fetch the value from the database
    * by defining a :show action on the GameController
    *
    * the most "real-time" way of doing it would be using WebSockets (ActionCable)
    */
    minutesBookedElement.textContent = minutesBooked;

    this.calculateFinalPrice();
  }

  decrement(event) {
    let minutesBooked = 0;
    let minutesBookedElement = null;

    this.minutesBookedTargets.forEach((element, _index) => {
      if (element.parentNode.dataset.gameId == event.currentTarget.parentNode.dataset.gameId) {
        minutesBooked = parseInt(element.textContent) - 1;
        minutesBookedElement = element;
      }
    });

    if (minutesBooked < 0) return;

    const formData = new FormData();
    formData.append("game[minutes_booked]", minutesBooked);

    this.sendData(event.currentTarget.parentNode.dataset.updateUrl, formData);
    minutesBookedElement.textContent = minutesBooked;

    this.calculateFinalPrice();
  }

  sendData(url, formData) {
    fetch(url, {
      body: formData,
      dataType: 'script',
      headers: { 'X-CSRF-Token': document.head.querySelector('meta[name="csrf-token"]').content },
      method: 'PATCH',
    }).then((response) => { console.log(response); })
  }

  calculateFinalPrice() {
    let totalMinutesBooked = 0;
    let finalPrice = 0;

    this.minutesBookedTargets.forEach((element, _index) => {
      totalMinutesBooked += parseInt(element.textContent);
      finalPrice += (parseInt(element.textContent) * parseInt(element.dataset.pricePerMinute));
    });

    if (parseInt(finalPrice) !== 0) {
      document.querySelector('#final-price').textContent = `${totalMinutesBooked} min added · total $${finalPrice}`;
      document.querySelector('#js-checkout').disabled = false;
    } else {
      document.querySelector('#final-price').textContent = 'Add minutes to your campaign';
      document.querySelector('#js-checkout').disabled = true;
    }
  }
}
