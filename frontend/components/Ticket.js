export default class Ticket {
  #ID = '';
  #DepartureAirport = '';
  #ArrivalAirport = '';
  #Date = '';
  #Cost = -1;
  #passenger = ''
  #ticketOrder = -1;

  constructor({
    ticketID,
    DepartureAirport,
    ArrivalAirport,
    Date,
    Cost,
    onEditTicket,
  
  }) {
    this.#ID = ticketID;
    this.#DepartureAirport = DepartureAirport;
    this.#ArrivalAirport = ArrivalAirport;
    this.#Date = Date;
    this.#Cost = Cost;
    this.onEditTicket = onEditTicket;
  }

  get ticketID() { return this.#ID; }
  get ticketArrivalArrport() { return this.#ArrivalAirport; }
  get ticketDeapartureArrport() { return this.#DepartureAirport; }
  get ticketDate() { return this.#Date; }
  get ticketCost() { return this.#Cost; }

  
  set ticketOrder(value) {
    if (typeof value === 'number' && value >= 0) {
      this.#ticketOrder = value;
    }
  }
  render() {
    const liElement = document.createElement('li');
    liElement.classList.add('ticketlist__tickets-list-item', 'ticket');
    liElement.setAttribute('id', this.#ID);
    liElement.setAttribute('draggable', true);
    liElement.addEventListener('dragstart', (evt) => {
      evt.target.classList.add('ticket_selected');
      localStorage.setItem('movedticketID', this.#ID);
    });
    liElement.addEventListener('dragend', (evt) => evt.target.classList.remove('ticket_selected'));

    const name = document.createElement('input');
    name.type = 'text'
    name.placeholder = 'name'
    name.classList.add('ticket__passenger_name');
    name.innerHTML = "meow";
    liElement.appendChild(name);

    const departure = document.createElement('span');
    departure.classList.add('ticket__departure');
    departure.innerHTML = this.#DepartureAirport;
    liElement.appendChild(departure);

    const arrival = document.createElement('span');
    arrival.classList.add('ticket__arrival');
    arrival.innerHTML = this.#ArrivalAirport;
    liElement.appendChild(arrival);

    const date = document.createElement('span');
    date.classList.add('ticket__date');
    date.innerHTML = this.#Date;
    liElement.appendChild(date);
    
    const cost = document.createElement('span');
    cost.classList.add('ticket__cost');
    cost.innerHTML = this.#Cost;
    liElement.appendChild(cost);

    const controlsDiv = document.createElement('div');
    controlsDiv.classList.add('ticket__controls');

    const lowerRowDiv = document.createElement('div');
    lowerRowDiv.classList.add('ticket__controls-row');

    const editBtn = document.createElement('button');
    editBtn.setAttribute('type', 'button');
    editBtn.classList.add('ticket__contol-btn', 'edit-icon');
    editBtn.addEventListener('click', () => {
      let input = liElement.querySelector(`input`)
      this.onEditTicket({ ticketID: this.#ID, name: input.value })
    });
    lowerRowDiv.appendChild(editBtn);

    // const deleteBtn = document.createElement('button');
    // deleteBtn.setAttribute('type', 'button');
    // deleteBtn.classList.add('ticket__contol-btn', 'delete-icon');
    // deleteBtn.addEventListener('click', () => this.onDeleteticket({ ticketID: this.#ID }));
    // lowerRowDiv.appendChild(deleteBtn);

    controlsDiv.appendChild(lowerRowDiv);

    liElement.appendChild(controlsDiv);

    return liElement;
  }
};
