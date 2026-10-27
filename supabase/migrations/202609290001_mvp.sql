-- ManoCerca MVP. Apply in Supabase SQL Editor or with the Supabase CLI.
create schema if not exists extensions;
create extension if not exists postgis with schema extensions;
grant usage on schema extensions to anon, authenticated;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('client','professional')),
  full_name text not null,
  phone text not null default '',
  zone text not null default '',
  created_at timestamptz not null default now()
);
create table if not exists public.professionals (
  id uuid primary key references public.profiles(id) on delete cascade,
  full_name text not null,
  specialty text not null,
  experience_years integer not null default 0 check (experience_years between 0 and 70),
  zone text not null default '',
  available boolean not null default true,
  bio text not null default '',
  photo_url text not null default '',
  completed_count integer not null default 0,
  rating numeric(3,2) not null default 0,
  latitude double precision not null default -16.3989,
  longitude double precision not null default -71.5350
);
create index if not exists professionals_specialty_zone_idx on public.professionals(specialty,zone) where available;
create index if not exists professionals_location_idx on public.professionals using gist ((extensions.ST_SetSRID(extensions.ST_MakePoint(longitude,latitude),4326)::extensions.geography));
create table if not exists public.portfolio_photos (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals(id) on delete cascade,
  url text not null,
  storage_path text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id),
  professional_id uuid references public.professionals(id),
  specialty text not null,
  title text not null check (length(title) between 3 and 90),
  description text not null check (length(description) between 10 and 1200),
  address text not null,
  zone text not null,
  latitude double precision not null,
  longitude double precision not null,
  urgent boolean not null default false,
  scheduled_at date,
  status text not null default 'REQUESTED' check (status in ('REQUESTED','QUOTED','ACCEPTED','COMPLETED','CANCELLED','DISPUTED')),
  created_at timestamptz not null default now()
);
create index if not exists requests_client_idx on public.service_requests(client_id,created_at desc);
create index if not exists requests_specialty_idx on public.service_requests(specialty,status,created_at desc);
create table if not exists public.request_photos (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.service_requests(id) on delete cascade,
  storage_path text not null,
  created_at timestamptz not null default now()
);
create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.service_requests(id) on delete cascade,
  professional_id uuid not null references public.professionals(id),
  version integer not null check (version > 0),
  price numeric(10,2) not null check (price > 0),
  description text not null,
  notes text not null default '',
  status text not null default 'PENDING' check (status in ('PENDING','ACCEPTED','REJECTED','SUPERSEDED')),
  created_at timestamptz not null default now(),
  unique(request_id,professional_id,version)
);
create index if not exists quotes_request_idx on public.quotes(request_id,created_at desc);
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.service_requests(id),
  client_id uuid not null references public.profiles(id),
  professional_id uuid not null references public.professionals(id),
  quote_id uuid not null references public.quotes(id),
  status text not null default 'ACCEPTED' check (status in ('QUOTED','ACCEPTED','COMPLETED','CANCELLED','DISPUTED')),
  on_the_way boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists services_client_idx on public.services(client_id,created_at desc);
create index if not exists services_pro_idx on public.services(professional_id,created_at desc);
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id),
  reviewer_id uuid not null references public.profiles(id),
  reviewee_id uuid not null references public.profiles(id),
  rating integer not null check (rating between 1 and 5),
  comment text not null check (length(comment) between 3 and 1000),
  created_at timestamptz not null default now(),
  unique(service_id,reviewer_id)
);
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications(user_id,created_at desc);
alter publication supabase_realtime add table public.notifications;
create table if not exists public.incidents (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id),
  reporter_id uuid not null references public.profiles(id),
  description text not null check (length(description) between 5 and 2000),
  status text not null default 'OPEN' check (status in ('OPEN','IN_REVIEW','RESOLVED','CLOSED')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
declare
  user_role text := case when new.raw_user_meta_data->>'role' = 'professional' then 'professional' else 'client' end;
  display_name text := coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'),''),split_part(new.email,'@',1));
begin
  insert into public.profiles(id,role,full_name,phone,zone)
  values(new.id,user_role,display_name,coalesce(new.raw_user_meta_data->>'phone',''),coalesce(new.raw_user_meta_data->>'zone',''));
  if user_role = 'professional' then
    insert into public.professionals(id,full_name,specialty,zone)
    values(new.id,display_name,coalesce(new.raw_user_meta_data->>'specialty','Otros'),coalesce(new.raw_user_meta_data->>'zone',''));
  end if;
  return new;
end $$;
revoke all on function public.handle_new_user() from public;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.professionals enable row level security;
alter table public.portfolio_photos enable row level security;
alter table public.service_requests enable row level security;
alter table public.request_photos enable row level security;
alter table public.quotes enable row level security;
alter table public.services enable row level security;
alter table public.reviews enable row level security;
alter table public.notifications enable row level security;
alter table public.incidents enable row level security;

create policy "profile_self_read" on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "profile_self_update" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy "professionals_public_read" on public.professionals for select to anon, authenticated using (true);
create policy "professionals_self_update" on public.professionals for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy "portfolio_public_read" on public.portfolio_photos for select to anon, authenticated using (true);
create policy "portfolio_self_insert" on public.portfolio_photos for insert to authenticated with check (professional_id = (select auth.uid()) and split_part(storage_path,'/',1) = (select auth.uid())::text);
create policy "request_read_participants" on public.service_requests for select to authenticated using (
  client_id = (select auth.uid()) or exists (
    select 1 from public.professionals p where p.id = (select auth.uid())
    and (professional_id = p.id or (professional_id is null and service_requests.specialty = p.specialty))
  )
);
create policy "request_insert_client" on public.service_requests for insert to authenticated with check (
  client_id = (select auth.uid()) and status = 'REQUESTED'
  and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'client')
);
create policy "photo_read_for_request" on public.request_photos for select to authenticated using (
  exists (select 1 from public.service_requests r where r.id = request_id)
);
create policy "photo_insert_by_client" on public.request_photos for insert to authenticated with check (
  split_part(storage_path,'/',1) = (select auth.uid())::text
  and exists (select 1 from public.service_requests r where r.id = request_id and r.client_id = (select auth.uid()))
);
create policy "quote_read_participants" on public.quotes for select to authenticated using (
  professional_id = (select auth.uid()) or exists (
    select 1 from public.service_requests r where r.id = request_id and r.client_id = (select auth.uid())
  )
);
create policy "service_read_participants" on public.services for select to authenticated using (client_id = (select auth.uid()) or professional_id = (select auth.uid()));
create policy "review_public_read" on public.reviews for select to anon, authenticated using (true);
create policy "review_after_completion" on public.reviews for insert to authenticated with check (
  reviewer_id = (select auth.uid()) and reviewer_id <> reviewee_id
  and exists (select 1 from public.services s where s.id = service_id and s.status = 'COMPLETED'
    and ((s.client_id = reviewer_id and s.professional_id = reviewee_id)
      or (s.professional_id = reviewer_id and s.client_id = reviewee_id)))
);
create policy "notification_self_read" on public.notifications for select to authenticated using (user_id = (select auth.uid()));
create policy "notification_self_update" on public.notifications for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "incident_read_participants" on public.incidents for select to authenticated using (
  exists (select 1 from public.services s where s.id = service_id and (s.client_id = (select auth.uid()) or s.professional_id = (select auth.uid())))
);
create policy "incident_insert_participant" on public.incidents for insert to authenticated with check (
  reporter_id = (select auth.uid()) and exists (select 1 from public.services s where s.id = service_id and (s.client_id = (select auth.uid()) or s.professional_id = (select auth.uid())))
);

-- Browser clients may edit profile fields, but cannot mint a role, rating or notification.
revoke update on public.profiles from authenticated;
grant update(full_name,phone,zone) on public.profiles to authenticated;
revoke update on public.professionals from authenticated;
grant update(full_name,specialty,experience_years,zone,available,bio,photo_url,latitude,longitude) on public.professionals to authenticated;
revoke update on public.notifications from authenticated;
grant update(read) on public.notifications to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('request-photos','request-photos',false,5242880,array['image/jpeg','image/png','image/webp','image/gif'])
on conflict(id) do nothing;
create policy "request_photos_participant_read" on storage.objects for select to authenticated using (
  bucket_id = 'request-photos' and exists (
    select 1 from public.request_photos ph
    join public.service_requests r on r.id=ph.request_id
    where ph.storage_path=name and (r.client_id=(select auth.uid()) or
      exists(select 1 from public.professionals p where p.id=(select auth.uid())
        and (r.professional_id=p.id or (r.professional_id is null and r.specialty=p.specialty))))
  )
);
create policy "request_photos_owner_upload" on storage.objects for insert to authenticated with check (
  bucket_id = 'request-photos' and (storage.foldername(name))[1] = (select auth.uid())::text
);
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('professional-media','professional-media',true,5242880,array['image/jpeg','image/png','image/webp','image/gif'])
on conflict(id) do nothing;
create policy "professional_media_public_read" on storage.objects for select to anon, authenticated using (bucket_id = 'professional-media');
create policy "professional_media_owner_upload" on storage.objects for insert to authenticated with check (
  bucket_id = 'professional-media' and (storage.foldername(name))[1] = (select auth.uid())::text
);

create or replace function public.search_professionals(
  p_specialty text default null, p_zone text default null,
  p_lat double precision default -16.3989, p_lng double precision default -71.5350,
  p_radius_km integer default 25, p_available_only boolean default false
) returns table(id uuid, full_name text, specialty text, zone text, available boolean, rating numeric,
  completed_count integer, experience_years integer, bio text, photo_url text,
  latitude double precision, longitude double precision, distance_km numeric)
language sql stable security invoker set search_path = public, extensions as $$
  select p.id,p.full_name,p.specialty,p.zone,p.available,p.rating,p.completed_count,
    p.experience_years,p.bio,p.photo_url,p.latitude,p.longitude,
    round((extensions.ST_Distance(
      extensions.ST_SetSRID(extensions.ST_MakePoint(p.longitude,p.latitude),4326)::extensions.geography,
      extensions.ST_SetSRID(extensions.ST_MakePoint(p_lng,p_lat),4326)::extensions.geography
    )/1000)::numeric,1)
  from public.professionals p
  where (p_specialty is null or p.specialty = p_specialty)
    and (p_zone is null or p.zone = p_zone)
    and (not p_available_only or p.available)
    and extensions.ST_DWithin(
      extensions.ST_SetSRID(extensions.ST_MakePoint(p.longitude,p.latitude),4326)::extensions.geography,
      extensions.ST_SetSRID(extensions.ST_MakePoint(p_lng,p_lat),4326)::extensions.geography,
      p_radius_km * 1000
    )
  order by p.rating desc,p.completed_count desc,distance_km asc;
$$;

grant execute on function public.search_professionals(text,text,double precision,double precision,integer,boolean) to anon, authenticated;

create or replace function public.submit_quote(p_request_id uuid,p_price numeric,p_description text,p_notes text default '')
returns uuid language plpgsql security definer set search_path = public as $$
declare
  target_request public.service_requests%rowtype;
  next_version integer;
  new_id uuid;
begin
  if auth.uid() is null then raise exception 'Inicia sesión como maestro'; end if;
  select * into target_request from public.service_requests where id=p_request_id for update;
  if not found then raise exception 'Solicitud no encontrada'; end if;
  if not exists(select 1 from public.professionals p where p.id=auth.uid() and
    (target_request.professional_id=p.id or (target_request.professional_id is null and target_request.specialty=p.specialty))) then
    raise exception 'Esta solicitud no corresponde a tu especialidad';
  end if;
  if target_request.status not in ('REQUESTED','QUOTED','ACCEPTED') then raise exception 'La solicitud ya está cerrada'; end if;
  if p_price is null or p_price <= 0 or length(trim(coalesce(p_description,''))) < 3 then raise exception 'Indica un precio y un alcance válidos'; end if;
  select coalesce(max(version),0)+1 into next_version from public.quotes where request_id=p_request_id and professional_id=auth.uid();
  update public.quotes set status='SUPERSEDED' where request_id=p_request_id and professional_id=auth.uid() and status in ('PENDING','ACCEPTED');
  insert into public.quotes(request_id,professional_id,version,price,description,notes)
  values(p_request_id,auth.uid(),next_version,p_price,trim(p_description),coalesce(p_notes,'')) returning id into new_id;
  update public.service_requests set status='QUOTED' where id=p_request_id;
  update public.services set status='QUOTED',on_the_way=false where request_id=p_request_id and status='ACCEPTED';
  insert into public.notifications(user_id,title,message) values(target_request.client_id,'Nueva cotización','Recibiste una propuesta para '||target_request.title||'.');
  return new_id;
end $$;
revoke all on function public.submit_quote(uuid,numeric,text,text) from public;
grant execute on function public.submit_quote(uuid,numeric,text,text) to authenticated;

create or replace function public.decide_quote(p_quote_id uuid,p_accept boolean)
returns void language plpgsql security definer set search_path = public as $$
declare
  chosen public.quotes%rowtype;
  target_request public.service_requests%rowtype;
begin
  if auth.uid() is null then raise exception 'Inicia sesión como cliente'; end if;
  select * into chosen from public.quotes where id=p_quote_id for update;
  if not found or chosen.status <> 'PENDING' then raise exception 'La cotización ya no está disponible'; end if;
  select * into target_request from public.service_requests where id=chosen.request_id for update;
  if target_request.client_id <> auth.uid() then raise exception 'Solo el cliente puede responder'; end if;
  if target_request.status not in ('QUOTED','REQUESTED') then raise exception 'La solicitud ya está cerrada'; end if;
  update public.quotes set status=case when p_accept then 'ACCEPTED' else 'REJECTED' end where id=p_quote_id;
  if p_accept then
    update public.quotes set status='REJECTED' where request_id=chosen.request_id and id<>p_quote_id and status='PENDING';
    update public.service_requests set status='ACCEPTED',professional_id=chosen.professional_id where id=chosen.request_id;
    insert into public.services(request_id,client_id,professional_id,quote_id,status,on_the_way)
    values(chosen.request_id,target_request.client_id,chosen.professional_id,p_quote_id,'ACCEPTED',false)
    on conflict(request_id) do update set professional_id=excluded.professional_id,quote_id=excluded.quote_id,status='ACCEPTED',on_the_way=false;
  end if;
  insert into public.notifications(user_id,title,message)
  values(chosen.professional_id,case when p_accept then 'Cotización aceptada' else 'Cotización rechazada' end,
    'El cliente respondió a tu propuesta para '||target_request.title||'.');
end $$;
revoke all on function public.decide_quote(uuid,boolean) from public;
grant execute on function public.decide_quote(uuid,boolean) to authenticated;

create or replace function public.update_service_status(p_service_id uuid,p_action text)
returns void language plpgsql security definer set search_path = public as $$
declare
  target_service public.services%rowtype;
  title text;
begin
  if auth.uid() is null then raise exception 'Inicia sesión para actualizar el servicio'; end if;
  select * into target_service from public.services where id=p_service_id for update;
  if not found then raise exception 'Servicio no encontrado'; end if;
  if auth.uid() not in (target_service.client_id,target_service.professional_id) then raise exception 'No participas en este servicio'; end if;
  if target_service.status <> 'ACCEPTED' and not (target_service.status = 'QUOTED' and p_action = 'cancel') then raise exception 'El servicio no está activo'; end if;
  if p_action='on_the_way' and auth.uid()=target_service.professional_id then
    update public.services set on_the_way=true where id=p_service_id;
    title:='Maestro en camino';
  elsif p_action='complete' and auth.uid()=target_service.professional_id then
    update public.services set status='COMPLETED',completed_at=now() where id=p_service_id;
    update public.service_requests set status='COMPLETED' where id=target_service.request_id;
    update public.professionals set completed_count=completed_count+1 where id=target_service.professional_id;
    title:='Servicio completado';
  elsif p_action='cancel' and auth.uid()=target_service.client_id then
    update public.services set status='CANCELLED' where id=p_service_id;
    update public.service_requests set status='CANCELLED' where id=target_service.request_id;
    title:='Servicio cancelado';
  elsif p_action='dispute' then
    update public.services set status='DISPUTED' where id=p_service_id;
    update public.service_requests set status='DISPUTED' where id=target_service.request_id;
    title:='Servicio en revisión';
  else
    raise exception 'No puedes realizar esta acción';
  end if;
  insert into public.notifications(user_id,title,message)
  values(case when auth.uid()=target_service.client_id then target_service.professional_id else target_service.client_id end,
    title,'Revisa el estado de tu servicio en ManoCerca.');
end $$;
revoke all on function public.update_service_status(uuid,text) from public;
grant execute on function public.update_service_status(uuid,text) to authenticated;

create or replace function public.refresh_professional_rating() returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.professionals set rating=coalesce((select round(avg(r.rating)::numeric,2) from public.reviews r where r.reviewee_id=new.reviewee_id),0)
  where id=new.reviewee_id;
  insert into public.notifications(user_id,title,message) values(new.reviewee_id,'Nueva calificación','Recibiste una reseña por un servicio completado.');
  return new;
end $$;
revoke all on function public.refresh_professional_rating() from public;
create trigger on_review_insert after insert on public.reviews for each row execute function public.refresh_professional_rating();

create or replace function public.notify_incident_update() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status then
    insert into public.notifications(user_id,title,message)
    values(new.reporter_id,'Incidencia actualizada','Tu reporte cambió al estado '||new.status||'.');
  end if;
  return new;
end $$;
revoke all on function public.notify_incident_update() from public;
create trigger on_incident_update after update of status on public.incidents
for each row execute function public.notify_incident_update();

-- Client-facing security: only authenticated clients can publish; quote and service transitions
-- are controlled by the functions above. Never place a service_role key in the Angular app.
