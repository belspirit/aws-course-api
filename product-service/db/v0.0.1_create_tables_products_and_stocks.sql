create extension if not exists "uuid-ossp";

create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  title varchar(255) not null,
  description varchar(400),
  price bigint not null default 0
);

create table if not exists stocks (
  product_id uuid primary key,
  count bigint not null default 0,
  foreign key (product_id) references products (id) on delete cascade
);