-- Supabase → SQL Editor → Run (todo el archivo)

drop table if exists partidas;

create table partidas (
  id bigserial primary key,
  usuario text not null,
  noche int not null check (noche in (1, 2)),
  puntuacion int not null default 0,
  created_at timestamptz not null default now()
);

alter table partidas enable row level security;

create policy "leer" on partidas for select using (true);
create policy "insertar" on partidas for insert with check (true);

insert into partidas (id, usuario, noche, puntuacion, created_at) values
  (1, 'nigger1',         1, 452, '2026-05-21 09:18:29+00'),
  (2, 'anto dam',        1, 285, '2026-05-21 11:57:08+00'),
  (3, 'jaiuro',          2, 512, '2026-05-22 06:08:54+00'),
  (4, 'hugo',            2, 156, '2026-05-22 06:09:06+00'),
  (5, 'jairo gay 77777', 1, 175, '2026-05-22 06:10:31+00'),
  (6, 'jairo gay 77777', 1, 426, '2026-05-22 06:14:20+00'),
  (7, 'hugo',            1, 175, '2026-05-22 06:14:43+00'),
  (8, 'jairo gay 77777', 2, 319, '2026-05-22 06:16:06+00');

select setval(pg_get_serial_sequence('partidas', 'id'), 8);
