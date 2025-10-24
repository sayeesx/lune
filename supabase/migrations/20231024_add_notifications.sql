-- Create notifications table
create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  title text not null,
  message text not null,
  type text check (type in ('info', 'success', 'warning', 'error')) not null default 'info',
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on notifications table
alter table notifications enable row level security;

-- Create policy to read own notifications
create policy "Users can view own notifications" 
on notifications for select 
using (auth.uid() = user_id);

-- Add updated_at trigger
create trigger update_notifications_updated_at
  before update on notifications
  for each row
  execute function update_updated_at_column();