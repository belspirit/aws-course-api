with inserted as (
  insert into products (title, description, price)
  values ('Bali', 'Bali 60 days', 3200) returning id
)
insert into stocks (product_id, count)
values ((SELECT id from inserted), 8);

with inserted as (
  insert into products (title, description, price)
  values ('Thailand', 'Thailand 60 days', 2700) returning id
)
insert into stocks (product_id, count)
values ((SELECT id from inserted), 9);

with inserted as (
  insert into products (title, description, price)
  values ('Kuba', 'Kuba 30 days', 1600) returning id
)
insert into stocks (product_id, count)
values ((SELECT id from inserted), 10);

with inserted as (
  insert into products (title, description, price)
  values ('Elbrus', 'Elbrus 16 days', 1200) returning id
)
insert into stocks (product_id, count)
values ((SELECT id from inserted), 4);

with inserted as (
  insert into products (title, description, price)
  values ('Spain', 'Spain 30 days', 2100) returning id
)
insert into stocks (product_id, count)
values ((SELECT id from inserted), 12);

with inserted as (
  insert into products (title, description, price)
  values ('Japan', 'Japan 60 days', 3000) returning id
)
insert into stocks (product_id, count)
values ((SELECT id from inserted), 8);

with inserted as (
  insert into products (title, description, price)
  values ('China', 'China 20 days', 3000) returning id
)
insert into stocks (product_id, count)
values ((SELECT id from inserted), 6);

with inserted as (
  insert into products (title, description, price)
  values ('Italy', 'Italy 30 days', 2000) returning id
)
insert into stocks (product_id, count)
values ((SELECT id from inserted), 15);