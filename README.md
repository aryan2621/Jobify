# Jobify

A one and only solution for hiring people.

## Screenshots

<img width="1440" alt="Screenshot 2024-09-12 at 1 36 02 AM" src="https://github.com/user-attachments/assets/5ab9b899-e4fc-44e6-bcf9-b195fd4d0dfc">
<img width="1440" alt="Screenshot 2024-09-12 at 1 35 54 AM" src="https://github.com/user-attachments/assets/e5b3bc3c-a904-4ef1-bbdd-00d44aa640ee">
<img width="1440" alt="Screenshot 2024-09-12 at 1 35 45 AM" src="https://github.com/user-attachments/assets/e2f5a892-93c7-4426-a87e-b7e44220be95">
<img width="1440" alt="Screenshot 2024-09-12 at 1 35 34 AM" src="https://github.com/user-attachments/assets/5422427d-f876-4f46-a68c-a368f8361acc">
<img width="1440" alt="Screenshot 2024-09-12 at 1 40 58 AM" src="https://github.com/user-attachments/assets/3d398b47-5860-4b81-bf3c-24f480561ffe">
<img width="1440" alt="Screenshot 2024-09-12 at 1 37 22 AM" src="https://github.com/user-attachments/assets/cb8643e1-d2ab-4ecd-ae45-fbfb95675981">
<img width="1440" alt="Screenshot 2024-09-12 at 1 37 15 AM" src="https://github.com/user-attachments/assets/0e9e2d30-daa5-462b-a24f-912f03620ec6">
<img width="1440" alt="Screenshot 2024-09-12 at 1 37 03 AM" src="https://github.com/user-attachments/assets/a67a2880-67b0-4f89-8b98-99cabe3ced1b">
<img width="1440" alt="Screenshot 2024-10-23 at 1 24 21 AM" src="https://github.com/user-attachments/assets/f4a86475-eb56-45fe-be9a-614b02827ff3">
<img width="1437" alt="Screenshot 2024-10-23 at 1 27 04 AM (1)" src="https://github.com/user-attachments/assets/2b236c7e-4012-4e38-a847-93c577c568ba">

## Tech Stack

**Client:** Next, Firebase, Appwrite

## Run Locally

Clone the project

```bash
  git clone https://github.com/aryan2621/Jobify/
```

Go to the project directory

```bash
  cd Jobify
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run dev
```

## API Reference

#### Login

```http
  POST /login
```

| Parameter  | Type     | Description            |
| :--------- | :------- | :--------------------- |
| `email`    | `string` | **Required**. Email Id |
| `password` | `string` | **Required**. password |

#### Signup

```http
  POST /signup
```

| Parameter    | Type     | Description              |
| :----------- | :------- | :----------------------- |
| `email`      | `string` | **Required**. Email Id   |
| `password`   | `string` | **Required**. Password   |
| `first name` | `string` | **Required**. First Name |
| `last name`  | `string` | **Required**. Last Name  |

```http
  GET /posts
```

| Parameter | Type     | Description              |
| :-------- | :------- | :----------------------- |
| `token`   | `string` | **Required**. In headers |

```http
  DELETE /post
```

| Parameter | Type     | Description           |
| :-------- | :------- | :-------------------- |
| `postId`  | `string` | **Required**. Post Id |

```http
  POST /post
```

| Parameter  | Type     | Description               |
| :--------- | :------- | :------------------------ |
| `post Obj` | `string` | **Required**. Post Object |

```http
  GET /user
```

| Parameter | Type     | Description              |
| :-------- | :------- | :----------------------- |
| `token`   | `string` | **Required**. In headers |

## Deployment

To deploy this project run

```bash
  npm run build && npm run start
```

## Support

For support, email risha2621@gmail.com or join me at Linkedin https://www.linkedin.com/in/rishabh-verma-5366901a1/
