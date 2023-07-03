





$feature['info']=array(
    'icon'=>$feature['icon']
);
$feature['icon']=str_replace('php-core-app/users_files','uploads-sixtiesscoop.geoforms.ca', $feature['icon']);


if( isset($feature['data']['storyAttributes']['isBirthStory'])&&$feature['data']['storyAttributes']['isBirthStory']===true&&
    isset($feature['data']['storyAttributes']['hasStoryVideos'])&&$feature['data']['storyAttributes']['hasStoryVideos']===true){
    error_log(print_r($feature,true));
}

return $feature;