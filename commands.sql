echo "hello"

docker run -it ubuntu bash
winpty docker run -it ubuntu bash
mkdir -p /usr/src/app
touch /usr/src/app/index.js
exit
CREATE TABLE blogs (
    id SERIAL PRIMARY KEY,
    author text,
    url text NOT NULL,
    title text NOT NULL,
    likes integer DEFAULT 0
);

insert into blogs (author, url, title) values ('Niina Huhtala', 'https://rahamedia.fi/kasvussa', 'Kasvussa');
insert into blogs (author, url, title) values ('Johanna Alvestad', 'https://anna.fi/kalastajanvaimo/', 'Kalastajan vaimo');