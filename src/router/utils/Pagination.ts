export default class Pagination {
    pageSize: number;
    pageNumber: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';

    constructor(pageSize: number, pageNumber: number, sortBy: string = 'id', sortDirection: "ASC" | "DESC") {
        this.pageSize = +pageSize;
        this.pageNumber = +pageNumber;
        this.sortBy = sortBy;
        this.sortDirection = sortDirection;
    }

    get offset(): number {
        return this.pageSize * (this.pageNumber - 1);
    }

    get limit(): number {
        return this.pageSize;
    }
}
