import Ticketlist from './TicketList';
import Ticket from './Ticket';
import Auth from './Auth'


export default class App {
  #ticketlists = [];
  #role = ''
  
  onEscapeKeydown = (event) => {
    if (event.key === 'Escape') {
      const input = document.querySelector('.ticketlist-adder__input');
      input.style.display = 'none';
      input.value = '';

      document.querySelector('.ticketlist-adder__btn')
        .style.display = 'inherit';
    }
  };

  onInputKeydown = (event) => {
    if (event.key !== 'Enter') return;

    if (event.target.value) {
      const newTicketlist = new Ticketlist({
        name: event.target.value,
        // onMoveTicket: this.onMoveTicket,
        onDropTicketInTicketlist: this.onDropTicketInTicketlist,
        onEditTicket: this.onEditTicket,
        onDeleteTicket: this.onDeleteTicket
      });
      
      this.#ticketlists.push(newTicketlist);
      newTicketlist.render();
    }

    event.target.style.display = 'none';
    event.target.value = '';

    document.querySelector('.ticketlist-adder__btn')
      .style.display = 'inherit';
  };

  onDropTicketInTicketlist = (evt) => {
    evt.stopPropagation();

    const destTicketlistElement = evt.currentTarget;
    destTicketlistElement.classList.remove('ticketlist_droppable');

    const movedTicketID = localStorage.getItem('movedTicketID');
    const srcTicketlistID = localStorage.getItem('srcTicketlistID');
    const destTicketlistID = destTicketlistElement.getAttribute('id');

    localStorage.setItem('movedTicketID', '');
    localStorage.setItem('srcTicketlistID', '');

    if (!destTicketlistElement.querySelector(`[id="${movedTicketID}"]`)) return;

    const srcTicketlist = this.#ticketlists.find(ticketlist => ticketlist.ticketlistID === srcTicketlistID);
    const destTicketlist = this.#ticketlists.find(ticketlist => ticketlist.ticketlistID === destTicketlistID);

    if (srcTicketlistID !== destTicketlistID) {
      const movedTicket = srcTicketlist.deleteTicket({ ticketID: movedTicketID });
      destTicketlist.addTicket({ ticket: movedTicket });

      srcTicketlist.reorderTickets();
    }

    const destTicketsIDs = Array.from(
      destTicketlistElement.querySelector('.ticketlist__tickets-list').children,
      elem => elem.getAttribute('id')
    );

    destTicketsIDs.forEach((ticketID, order) => {
      destTicketlist.getTicketById({ ticketID }).ticketOrder = order;
    });
  };


  onEditTicket = ({ ticketID, name }) => {
    let fTicket = null;
    for (let ticketlist of this.#ticketlists) {
      fTicket = ticketlist.getTicketById({ ticketID });
      if (fTicket) break;
    }
    try {
      fetch("/sellTicket", {
        method: "POST",
        credentials: 'include',
        body: JSON.stringify({id: fTicket.ticketID, passenger: name}),
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        },
      }).then((response) => {
        if (response.status == 200) {
          document.getElementById(ticketID).remove();
          window.confirm = () => {return false}
          window.alert("Билет продан!");
        } else {
          window.alert("Ошибка сервера");
        }
      })
    } catch(error) {
      console.log(error)
    }

  };

  onDeleteTicket = ({ ticketID }) => {
    let fTicket = null;
    let fTicketlist = null;
    for (let ticketlist of this.#ticketlists) {
      fTicketlist = ticketlist;
      fTicket = ticketlist.getTicketById({ ticketID });
      if (fTicket) break;
    }

    const ticketShouldBeDeleted = confirm(`Задача '${fTicket.ticketText}' будет удалена. Прододлжить?`);

    if (!ticketShouldBeDeleted) return;

    fTicketlist.deleteTicket({ ticketID });

    document.getElementById(ticketID).remove();
  };
  async getTickets() {
    try {
      const req = await fetch('/getTickets');
      const tickets = await req.json()
      const newTicketList = new Ticketlist( {
        onDropTicketInTicketlist: this.onDropTicketInTicketlist,
        onEditTicket: this.onEditTicket,
        onDeleteTicket: this.onDeleteTicket
      })
      for (const elem of tickets) {
          if (elem) {
            const newTicket = new Ticket({
            ticketID: elem.idticket,
            DepartureAirport: elem.departure_airport,
            ArrivalAirport: elem.arrival_airport,
            Date: elem.departure_time_and_date,
            Cost: elem.cost,
            // onMoveTicket: this.onMoveTicket,
            onEditTicket: this.onEditTicket,
          });
          newTicketList.addTicket(newTicket);
        } else {
          console.log(elem)
        }
      }
      this.#ticketlists.push(newTicketList)
      newTicketList.render();
    } catch (error) {
      console.log(error)
    }
  }
  init() {
    const User = new Auth().render()
    document.getElementById('app-header__user-and-controls').appendChild(User)
    this.getTickets()
    document.querySelector('.ticketlist-adder__btn')
      .addEventListener(
        'click',
        (event) => {
          event.target.style.display = 'none';

          const input = document.querySelector('.ticketlist-adder__input');
          input.style.display = 'inherit';
          input.focus();
        }
      );

    document.addEventListener('keydown', this.onEscapeKeydown);

    document.querySelector('.ticketlist-adder__input')
      .addEventListener('keydown', this.onInputKeydown);

    document.getElementById('theme-switch')
      .addEventListener('change', (evt) => {
        (evt.target.checked
          ? document.body.classList.add('dark-theme')
          : document.body.classList.remove('dark-theme'));
      });

    document.addEventListener('dragover', (evt) => {
      evt.preventDefault();

      const draggedElement = document.querySelector('.ticket.ticket_selected');
      const draggedElementPrevList = draggedElement.closest('.ticketlist');

      const currentElement = evt.target;
      const prevDroppable = document.querySelector('.ticketlist_droppable');
      let curDroppable = evt.target;
      while (!curDroppable.matches('.ticketlist') && curDroppable !== document.body) {
        curDroppable = curDroppable.parentElement;
      }

      if (curDroppable !== prevDroppable) {
        if (prevDroppable) prevDroppable.classList.remove('ticketlist_droppable');

        if (curDroppable.matches('.ticketlist')) {
          curDroppable.classList.add('ticketlist_droppable');
        }
      }

      if (!curDroppable.matches('.ticketlist') || draggedElement === currentElement) return;

      if (curDroppable === draggedElementPrevList) {
        if (!currentElement.matches('.ticket')) return;

        const nextElement = (currentElement === draggedElement.nextElementSibling)
          ? currentElement.nextElementSibling
          : currentElement;

        curDroppable.querySelector('.ticketlist__tickets-list')
          .insertBefore(draggedElement, nextElement);

        return;
      }

      if (currentElement.matches('.ticket')) {
        curDroppable.querySelector('.ticketlist__tickets-list')
          .insertBefore(draggedElement, currentElement);

        return;
      }

      if (!curDroppable.querySelector('.ticketlist__tickets-list').children.length) {
        curDroppable.querySelector('.ticketlist__tickets-list')
          .appendChild(draggedElement);
      }
    });
  }
};
