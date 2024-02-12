import pg from 'pg'


export default class DB {
    #dbClient = null;
    #dbHost = '';
    #dbPort = '';
    #dbName = '';
    #dbLogin = '';
    #dbPassword = '';

    constructor() {
        this.#dbHost = process.env.DB_HOST;
        this.#dbPort = process.env.DB_PORT;
        this.#dbName = process.env.DB_NAME;
        this.#dbLogin = process.env.DB_LOGIN;
        this.#dbPassword = process.env.DB_PASSWORD;
        this.#dbClient = new pg.Client({
            host: this.#dbHost,
            user: this.#dbLogin,
            password: this.#dbPassword,
            port: this.#dbPort,
            database: this.#dbName
          });
    }
    async connect(){
        try {
            await this.#dbClient.connect();
            console.log('DB connection established ')
        } catch(error) {
            console.error('unable to connect to db: ', error)
        }
    }
    async disconnect() {
        try {
            await this.#dbClient.end()
            console.log('DB connection finished')
            return Promise.reject(error)
        } catch(error) {
            console.error('unable to disconnect from db: ', error)
        }
    }
    async deleteTicket(id) {
        try {
            const  query = await this.#dbClient.query(
                `
                    DELETE
                    FROM tickets
                    WHERE id_book = $1
                `, [id]
            ) 
        } catch (error) {
            console.log('Unable to delete ticket, error: ', error)
            return Prommise.reject({
                type: 'internal',
                error
            })
        }
    }
    async createTicket({id, cost, departureID} = {
        id: null,
        cost: -1,
        departureID: null
    }) {
        try {
            const  query = await this.#dbClient.query(
                `
                    INSERT INTO tickets(idTicket, cost, idd)
                    VALUES($1, $2, $3)
                `, [id, cost, departureID]
            ) 
        } catch (error) {
            console.log('Unable to creaate ticket, error: ', error)
            return Prommise.reject({
                type: 'internal',
                error
            })
        }
    }
    async getTickets() {
        var sql = 
        `
            SELECT idticket, Departure_airport, Arrival_airport, Departure_Time_And_Date, Cost
            FROM ticket join departure on(idD = idDeparture) join flight on(idF = idFlight)
            where Passenger_Name is null
        `        
        try {
            const tickets = await this.#dbClient.query(sql)
            return tickets.rows
        } catch (error) {
            console.log('Unable to get tickets, error: ', error)
            return Prommise.reject({
                type: 'internal',
                error
            })
        }
    }
    async getUser(login, password) {
        var sql = 
        `
            SELECT iduser, login, role
            FROM users
            Where TRUE
                and login = $1
                and password = $2
        `        
        try {
            const user = await this.#dbClient.query(sql, [login, password])
            if(user.rows.length == 0)
                throw new Error("no user found")
            return user.rows[0]
        } catch (error) {
            console.log('Unable to get user, error: ', error)
            return Promise.reject({
                type: 'internal',
                error
            })
        }
    }
    async sellTicket({id, name, date, cashierID} = {
        id: null,
        name: "",
        date: null,
        cashierID: null
    }) {
        if (!id || !name || !date || !cashierID) {
            const errMsg = `addTicket error: wrong params (name: ${name}, date: ${date},cashierID: ${cashierID},)`
            console.error(errMsg)
            return Promise.reject({
                type: "client",
                error: new Error(errMsg)
            })
        }
        var sql = 
        `
            UPDATE ticket
            SET Passenger_Name = $2, Date_of_sale = Date($3), idC = $4
            WHERE TRUE
                and idTicket = $1
        `        
        try {
            const user = await this.#dbClient.query(sql, [id, name, date, cashierID])
            return user.rows
        } catch (error) {
            return Prommise.reject({
                type: 'internal',
                error
            })
        }
    }
}