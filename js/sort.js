class Sort {
    constructor(obj) {
        if (this.constructor === Sort) {
            throw new TypeError("Can't initialize abstract class")
        }
        if (this.GenerateSortQuery === undefined) {
            throw new TypeError("GenerateSortQuery is not implemented")
        }
        this.pub = obj.query.pub
        this.sort = obj.query.sort
    }
}
class SingleCertSort extends Sort {
    constructor(obj) {
        super(obj)
    }
    GenerateSortQuery() {
        if (this.pub) {
            //  query = { 'issuedby.org_id': req.user.org_id, 'publish.status': true }
            if (this.sort) {
                this.sort = this.sort === "asc" ? { "publish.publish_date": 1 } : { "publish.publish_date": -1 }
            } else {
                this.sort = { "publish.publish_date": -1 }
            }

        } else {
            if (this.sort) {
                this.sort = this.sort === "asc" ? { issue_date: 1 } : { issue_date: -1 }
            } else {
                this.sort = { issue_date: -1 }
            }
        }
        return this.sort
    }

}
class BatchCertSort extends Sort {
    constructor(obj) {
        super(obj)
    }
    GenerateSortQuery() {
        let sort = null
        if (this.pub) {
            if (this.sort) {
                sort = this.sort === "asc" ? { "publish.publish_date": 1 } : { "publish.publish_date": -1 }
            } else {
                sort = { "publish.publish_date": -1 }
            }

        } else {
            if (this.sort) {
                sort = this.sort === "asc" ? { created_date: 1 } : { created_date: -1 }
            } else {
                sort = { created_date: -1 }
            }
        }
        return sort
    }
}
module.exports = {
    Sort,
    SingleCertSort,
    BatchCertSort
}