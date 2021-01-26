class search {
    constructor(obj) {
        if (this.constructor === search) {
            throw new TypeError("Can't insitaite abstratc class");
        }
        if (this.GenerateQuery === undefined) {
            throw new TypeError("GenerateQuery not implemmted");
        }
        this.title = obj.query.title
        this.fromdate = obj.query.fromdate
        this.todate = obj.query.todate
        this.uid = obj.user.org_id
        if (obj.query.pub) {
            this.pub = true
        } else {
            this.pub = false
        }
        this.dateprop = ""
    }
    GenrateDateQuery(query) {
        if (this.fromdate && this.todate) {
            this.fromdate = new Date(this.fromdate)
            this.fromdate.setHours(23, 59, 59, 999);
            this.todate = new Date(this.todate)
            this.todate.setHours(0, 0, 0, 0);
            query[this.dateprop] = {
                $lte: new Date(this.fromdate),
                $gte: new Date(this.todate)
            }

        } else if (this.fromdate) {
            this.fromdate = new Date(this.fromdate)
            this.fromdate.setHours(23, 59, 59, 999);
            query[this.dateprop] = {
                $lte: new Date(this.fromdate),
            }
        } else if (this.todate) {
            this.todate = new Date(this.todate)
            this.todate.setHours(0, 0, 0, 0);
            query[this.dateprop] = {
                $gte: new Date(this.todate)
            }
        }
    }
}
class SingleSearch extends search {
    constructor(obj) {
        super(obj)
        this.name = obj.query.name
    }
    GenerateQuery() {
        let query = {}

        if (this.pub) {
            query = { 'issuedby.org_id': this.uid, 'publish.status': true }
            this.dateprop = "publish.publish_date"
        } else {
            query = { 'issuedby.org_id': this.uid, 'publish.status': false }
            this.dateprop = "issue_date"
        }
        if (this.name) {
            query.name = { $regex: `.*${this.name}.*`, $options: 'i' }
        }
        if (this.title) {
            query.title = { $regex: `.*${this.title}.*`, $options: 'i' }
        }
        this.GenrateDateQuery(query)
        return query
    }
}
class BatchesSearch extends search {
    constructor(obj) {
        super(obj)
        this.batch_name = obj.query.batch_name
    }
    GenerateQuery() {
        let query = {}
        let dateprop = ""
        if (this.pub) {
            query = { 'issuedby.org_id': this.uid, 'publish.status': true }
            dateprop = "publish.publish_date"
        } else {
            query = { 'issuedby.org_id': this.uid, 'publish.status': false }
            dateprop = "created_date"
        }
        if (this.batch_name) {
            query.name = { $regex: `.*${this.batch_name}.*`, $options: 'i' }
        }
        if (this.title) {
            query.title = { $regex: `.*${this.title}.*`, $options: 'i' }
        }
        this.GenrateDateQuery()
        return query
    }


}
module.exports = {
    search,
    SingleSearch,
    BatchesSearch
}