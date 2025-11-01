-- Create chat_history table
create table if not exists public.chat_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.chat_history enable row level security;

-- Create policies for chat_history
create policy "Users can view their own chat history"
on public.chat_history for select
using (auth.uid() = user_id);

create policy "Users can insert their own chat history"
on public.chat_history for insert
with check (auth.uid() = user_id);

create policy "Users can update their own chat history"
on public.chat_history for update
using (auth.uid() = user_id);

create policy "Users can delete their own chat history"
on public.chat_history for delete
using (auth.uid() = user_id);

-- Create messages table
create table if not exists public.messages (
  id uuid default uuid_generate_v4() primary key,
  chat_id uuid references public.chat_history(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index for faster lookups
create index if not exists idx_messages_chat_id on public.messages(chat_id);
create index if not exists idx_messages_created_at on public.messages(created_at);

-- Enable Row Level Security
alter table public.messages enable row level security;

-- Create policies for messages
create policy "Users can view messages from their chats"
on public.messages for select
using (
  exists (
    select 1 from public.chat_history 
    where chat_history.id = messages.chat_id 
    and chat_history.user_id = auth.uid()
  )
);

create policy "Users can insert messages into their chats"
on public.messages for insert
with check (
  exists (
    select 1 from public.chat_history 
    where chat_history.id = messages.chat_id 
    and chat_history.user_id = auth.uid()
  )
);

-- Create function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create trigger for chat_history
create or replace trigger update_chat_history_updated_at
before update on public.chat_history
for each row
execute function update_updated_at_column();

-- Create function to update chat_history.updated_at when a new message is inserted
create or replace function update_chat_updated_at()
returns trigger as $$
begin
  update public.chat_history
  set updated_at = timezone('utc'::text, now())
  where id = new.chat_id;
  return new;
end;
$$ language plpgsql;

-- Create trigger for messages
create or replace trigger update_chat_on_new_message
after insert on public.messages
for each row
execute function update_chat_updated_at();
