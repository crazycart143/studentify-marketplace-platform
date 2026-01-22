-- Add default safe zones for major universities
insert into safe_zones (name, university, description, location_lat, location_lng)
values 
('Main Library Hub', 'Stanford University', 'Well-lit area near the main entrance with 24/7 security.', 37.4275, -122.1697),
('Student Union South', 'Stanford University', 'Busy public area near the cafe, ideal for daytime exchanges.', 37.4241, -122.1701),
('Campus Police Lobby', 'Harvard University', 'Official safe exchange zone monitored by campus police.', 42.3736, -71.1106),
('UCLA Bookstore Plaza', 'UCLA', 'High traffic open area, very safe during business hours.', 34.0700, -118.4452);
