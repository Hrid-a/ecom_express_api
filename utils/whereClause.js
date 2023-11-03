class WhereClause {
    constructor(base, bigQuery) {
        this.base = base;
        this.bigQuery = bigQuery;
    }

    search() {
        const searchWord = this.bigQuery.search ? {
            name: {
                $regex: this.bigQuery.search,
                $options: 'i'
            }
        } : {};

        this.base = this.base.find({ ...searchWord });
        return this;
    }

    filter() {

        const queryCopy = { ...this.bigQuery };

        delete queryCopy.search;
        delete queryCopy.page;

        const query = JSON.stringify(queryCopy).replace(/\b("gt"|"gte"| "lt"|lte"|)\b/g, match => `$${match}`);
        this.base = this.base.find({ ...JSON.parse(query) });
        return this;
    }

    paginator(resultPerPage) {

        const currentPage = this.bigQuery?.page || 1;
        this.base = this.base.find().skip(resultPerPage * (currentPage - 1)).limit(resultPerPage);
        return this;
    }
}

module.exports = WhereClause;