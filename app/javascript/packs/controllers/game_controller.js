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

    this.minutesBookedTargets.forEach((element) => {
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

    this.minutesBookedTargets.forEach((element) => {
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

  // this function does too much, refactor animation into its own function.
  calculateFinalPrice() {
    let totalMinutesBooked = 0;
    let finalPrice = 0;

    this.minutesBookedTargets.forEach((element) => {
      totalMinutesBooked += parseInt(element.textContent);
      finalPrice += (parseInt(element.textContent) * parseInt(element.dataset.pricePerMinute));
    });

    if (parseInt(finalPrice) !== 0) {
      // only run this animation once (when going from 0 to 1+ minutes)
      if (document.querySelector('#js-checkout').disabled) {
        // This (i.e. style injection) won't work if you have a strict Content Security Policy on the site
        // slowly fade-out old container (using CSS transitions)
        document.querySelector('.bottom-parent').style.height = 0;

        // this will be injected as a new container
        let bottomClone = document.querySelector('.bottom-parent').cloneNode(true);

        setTimeout(() => {
          // inject a new container, still invisible
          document.querySelector('.bottom-parent').insertAdjacentElement('afterend', bottomClone);

          // set desired values
          bottomClone.querySelector('#final-price').textContent = `${totalMinutesBooked} min added · total $${finalPrice}`;
          bottomClone.querySelector('#js-checkout').disabled = false;
          // then, slowly increase new element's height
          bottomClone.style.height = '75px';

          // wait till the CSS transition is over and remove old container from the DOM tree
          // because its children interfere with a new container's children
          // Admittedly, this is a hack. There should be a better way of doing it
          // known issue: when you try to add time too fast, it might show them incorrectly for a split of the second
          setTimeout(() => { document.querySelector('.bottom-parent').remove(); }, 400);
        },
        100)
      }

      document.querySelector('#final-price').textContent = `${totalMinutesBooked} min added · total $${finalPrice}`;
    } else {
      document.querySelector('#final-price').textContent = 'Add minutes to your campaign';
      document.querySelector('#js-checkout').disabled = true;
    }
  }
}
