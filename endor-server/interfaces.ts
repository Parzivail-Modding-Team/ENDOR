interface User {
  _id: String;
  sub: String;
  email: String;
}

interface Tag {
  _id: String;
  label: String;
}

interface Post {
  _id: String;
  author: User;
  createdAt: String;
  updatedAt: String;
  imageUrl: String;
  imageId: String;
  message: String;
  tags: [Tag];
}

export { User, Tag, Post };
