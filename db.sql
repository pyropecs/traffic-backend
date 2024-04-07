create table owners(
owner_id serial PRIMARY KEY not null,
vehicle_type varchar(20) not null,
bike_name varchar(50) not null,
plate_number varchar(20) not null,
violations text[] not null,
fine_amount int not null,
owner_photo text not null,
phone_no varchar(20) not null,
owner_name varchar(200) not null,
created_at timestamp not null,
updated_at timestamp not null);

-- X58YB5THD2VM2NAHWG938BFF