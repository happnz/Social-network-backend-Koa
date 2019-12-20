export default class PaginationResponse<E> {
    currentPage: number;
    perPage: number;
    lastPage: number;
    total: number;
    pageControls: number[];
    data: E[];

    static from<E>(data: E[], currentPage: number, perPage: number, count: number): PaginationResponse<E> {
        const res = new PaginationResponse<E>();
        res.currentPage = currentPage;
        res.perPage = perPage;
        const lastPage = Math.ceil(count / perPage);
        res.lastPage = lastPage;
        res.total = count;
        res.pageControls = this.createRange(currentPage, lastPage);
        res.data = data;
        return res;
    }

    private static createRange(currentPage: number, lastPage: number): number[] {
        let start = currentPage - 2;
        if (start < 1) {
            start = 1;
        }

        let end = currentPage + 2;
        if (end > lastPage) {
            end = lastPage;
        }

        const res: number[] = [];
        for (let i = start; i <= end; i++) {
            res.push(i);
        }

        return res;
    }
}
