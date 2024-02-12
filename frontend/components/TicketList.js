import Ticket from './Ticket';

export default class Ticketlist {
  #tickets = [];
  #ticketlistName = '';
  #ticketlistID = '';

  constructor({
    // onMoveTicket,
    onDropTicketInTicketlist,
    onEditTicket,
    onDeleteTicket
  }) {
    this.#ticketlistID = crypto.randomUUID();
    // this.onMoveTicket = onMoveTicket;
    this.onDropTicketInTicketlist = onDropTicketInTicketlist;
    this.onEditTicket = onEditTicket;
    this.onDeleteTicket = onDeleteTicket;
  }

  get ticketlistID() { return this.#ticketlistID; }

  addTicket = ( ticket ) => this.#tickets.push(ticket);

  getTicketById = ({ ticketID }) => this.#tickets.find(ticket => ticket.ticketID === ticketID);

  deleteTicket = ({ ticketID }) => {
    const deleteTicketIndex = this.#tickets.findIndex(ticket => ticket.ticketID === ticketID);

    if (deleteTicketIndex === -1) return;

    const [deletedTicket] = this.#tickets.splice(deleteTicketIndex, 1);

    return deletedTicket;
  };

  reorderTickets = () => {
    console.log(document.querySelector(`[id="${this.#ticketlistID}"] .ticketlist__tickets-list`));
    const orderedTicketsIDs = Array.from(
      document.querySelector(`[id="${this.#ticketlistID}"] .ticketlist__tickets-list`).children,
      elem => elem.getAttribute('id')
    );

    orderedTicketsIDs.forEach((ticketID, order) => {
      this.#tickets.find(ticket => ticket.ticketID === ticketID).ticketOrder = order;
    });

  };

  onAddNewTicket = () => {
    const newTicketText = prompt('Введите описание задачи:', 'Новая задача');
    
    if (!newTicketText) return;

    const newTicket = new Ticket({
      text: newTicketText,
      order: this.#tickets.length,
      // onMoveTicket: this.onMoveTicket,
      onEditTicket: this.onEditTicket,
      onDeleteTicket: this.onDeleteTicket
    });
    this.#tickets.push(newTicket);

    const newTicketElement = newTicket.render();
    document.querySelector(`[id="${this.#ticketlistID}"] .ticketlist__tickets-list`)
      .appendChild(newTicketElement);
  };

  render() {

    const liElement = document.createElement('li');
    liElement.classList.add(
      'ticketlists-list__item',
      'ticketlist'
    );
    liElement.setAttribute('id', this.#ticketlistID);
    liElement.addEventListener(
      'dragstart',
      () => localStorage.setItem('srcTicketlistID', this.#ticketlistID)
    );
    liElement.addEventListener('drop', this.onDropTicketInTicketlist);

    const h2Element = document.createElement('h2');
    h2Element.classList.add('ticketlist__name');
    h2Element.innerHTML = this.#ticketlistName;
    liElement.appendChild(h2Element);
    
    const innerUlElement = document.createElement('ul');
    innerUlElement.classList.add('ticketlist__tickets-list');
    liElement.appendChild(innerUlElement);

    const button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.classList.add('ticketlist__add-ticket-btn');
    button.innerHTML = '&#10010; Добавить карточку';
    button.addEventListener('click', this.onAddNewTicket);
    liElement.appendChild(button);

    const adderElement = document.querySelector('.ticketlist-adder');
    adderElement.parentElement.insertBefore(liElement, adderElement);
    for (let elem of this.#tickets) {
      const newTicketElem = elem.render()
      document.querySelector(`[id="${this.#ticketlistID}"] .ticketlist__tickets-list`)
        .appendChild(newTicketElem)
    }
  }
};
