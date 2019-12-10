import PostResponse from './PostResponse';
import FriendResponse from './FriendResponse';

export default class PostWithAuthorResponse extends PostResponse {
  public author: FriendResponse;

  constructor(
        id: number,
        text: string,
        createdAt: Date,
        updatedAt: Date,
        author: FriendResponse
    ) {
        super(id, text, createdAt, updatedAt);
        this.author = author;
    }
}
