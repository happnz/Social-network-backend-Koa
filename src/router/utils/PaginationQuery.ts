export default interface PaginationQuery {
    pageSize?: number;
    pageNumber?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
}
