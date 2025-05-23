INSERT INTO public.account(
account_firstname,
account_lastname,
account_email,
account_password
)
VALUES(
'Tony',
'Stark',
'tony@starkent.com',
'Iam1ronM@n'
)


UPDATE account
SET account_type = 'Admin'
WHERE account_firstname = 'Tony';


DELETE FROM account
WHERE account_firstname = 'Tony';


UPDATE inventory
SET inv_description = REPLACE('Do you have 6 kids and like to go offroading? The Hummer gives you the small interiors with an engine to get you out of any muddy or rocky situation.', 'small interiors', 'a huge interior')
WHERE inv_id = 10;


SELECT 
    inv_make, 
    inv_model, 
    classification.classification_name
FROM 
    inventory
INNER JOIN 
    classification 
ON 
    inventory.classification_id = classification.classification_id
WHERE 
    classification.classification_name = 'Sport';


UPDATE inventory
SET 
  inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
  inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');
