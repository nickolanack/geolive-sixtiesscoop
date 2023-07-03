





$feature['info']=array(
    'icon'=>$feature['icon']
);
$feature['icon']=str_replace('php-core-app/users_files','uploads-sixtiesscoop.geoforms.ca', $feature['icon']);

error_log(print_r($feature,true));

return $feature;