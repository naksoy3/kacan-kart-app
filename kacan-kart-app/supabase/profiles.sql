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

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view profile avatars" on storage.objects;
create policy "Public can view profile avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "Users can upload own profile avatars" on storage.objects;
create policy "Users can upload own profile avatars"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and owner_id = auth.uid()::text);

drop policy if exists "Users can update own profile avatars" on storage.objects;
create policy "Users can update own profile avatars"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and owner_id = auth.uid()::text)
  with check (bucket_id = 'avatars' and owner_id = auth.uid()::text);

update auth.users
   set raw_user_meta_data = raw_user_meta_data - 'avatar_url'
 where raw_user_meta_data ->> 'avatar_url' like 'data:image/%';

update public.profiles
   set avatar_url = null
 where avatar_url like 'data:image/%';

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

drop policy if exists "Users can mark own notifications read" on public.notifications;
create policy "Users can mark own notifications read"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop function if exists public.notify_card_accepted(uuid);

create or replace function public.notify_card_accepted(p_card_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  card_owner uuid;
  card_question text;
  card_target text;
  card_sender text;
begin
  select user_id, soru, target_username, from_username
    into card_owner, card_question, card_target, card_sender
    from public.cards
   where id = p_card_id;

  if card_owner is null and card_sender is not null then
    select id
      into card_owner
      from public.profiles
     where lower(username) = lower(card_sender)
        or lower(full_name) = lower(card_sender)
     limit 1;
  end if;

  if card_owner is null then
    return false;
  end if;

  if exists (
    select 1 from public.notifications
     where card_id = p_card_id and type = 'card_accepted'
  ) then
    return true;
  end if;

  insert into public.notifications (user_id, card_id, type, title, message)
  values (
    card_owner,
    p_card_id,
    'card_accepted',
    'Kartına Evet cevabı geldi! 🎉',
    format(
      '%s soruna Evet yanıtı verdi: %s',
      coalesce(card_target, 'Alıcı'),
      coalesce(card_question, 'Gönderdiğin soru kartı kabul edildi.')
    )
  );
  return true;
end;
$$;

grant execute on function public.notify_card_accepted(uuid) to anon, authenticated;

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 2000),
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

drop policy if exists "Users can read sent or received messages" on public.messages;
create policy "Users can read sent or received messages"
  on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = recipient_id);

drop policy if exists "Users can send messages as themselves" on public.messages;
create policy "Users can send messages as themselves"
  on public.messages for insert
  with check (auth.uid() = sender_id and sender_id <> recipient_id);

drop policy if exists "Recipients can mark messages read" on public.messages;
create policy "Recipients can mark messages read"
  on public.messages for update
  using (auth.uid() = recipient_id)
  with check (auth.uid() = recipient_id);
