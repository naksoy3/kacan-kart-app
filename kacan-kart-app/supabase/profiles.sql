create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username = lower(username)),
  full_name text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Public can check usernames" on public.profiles;
create policy "Public can check usernames"
  on public.profiles for select
  using (true);

drop policy if exists "Users can create own profile" on public.profiles;
create policy "Users can create own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id uuid references public.cards(id) on delete cascade,
  type text not null default 'card_accepted',
  title text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

drop policy if exists "Users can read own notifications" on public.notifications;
create policy "Users can read own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create or replace function public.notify_card_accepted(p_card_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  card_owner uuid;
  card_question text;
begin
  select user_id, soru
    into card_owner, card_question
    from public.cards
   where id = p_card_id;

  if card_owner is null then
    return;
  end if;

  if exists (
    select 1 from public.notifications
     where card_id = p_card_id and type = 'card_accepted'
  ) then
    return;
  end if;

  insert into public.notifications (user_id, card_id, type, title, message)
  values (
    card_owner,
    p_card_id,
    'card_accepted',
    'Kartına Evet cevabı geldi! 🎉',
    coalesce(card_question, 'Gönderdiğin soru kartı kabul edildi.')
  );
end;
$$;

grant execute on function public.notify_card_accepted(uuid) to anon, authenticated;
