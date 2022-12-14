import dataStore from 'nedb-promise';

export class BookStore{
    constructor({filename, autoload}){
        this.store = dataStore({filename, autoload});
    }

    async find(props){
        return this.store.find(props);
    }
    async findOne(props){
        return this.store.findOne(props);
    }
    async insert(book){
        let bookName = book.name;
        let bookAuthor = book.author;
        let bookPublishDate = book.publish_date;
        let bookPages = book.pages;

        if(!bookName || !bookAuthor || !bookPublishDate || !bookPages){
            throw new Error("Missing informations.")
        }
        return this.store.insert(book);

    }

    async update(props, book){
        return this.store.update(props, book);
    }
    async remove(props){
        return this.store.remove(props);
    }
}

export default new BookStore({filename: './db/books.json', autoload: true});