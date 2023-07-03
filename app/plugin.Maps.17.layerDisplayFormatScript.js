





$feature['info']=array(
    'icon'=>$feature['icon']
);
$feature['icon']=str_replace('php-core-app/users_files','uploads-sixtiesscoop.geoforms.ca', $feature['icon']);


if( isset($feature['data']['storyAttributes']['isBirthStory'])&&
    isset($feature['data']['storyAttributes']['hasStoryVideos'])){
        
    $birthStory=$feature['data']['storyAttributes']['isBirthStory'];
    $hasStoryVideos=$feature['data']['storyAttributes']['hasStoryVideos'];
    
    if(($birthStory==="true"||$birthStory===true)
        &&($hasStoryVideos$feature==="true"||$hasStoryVideos$feature===true)){
        
         error_log(print_r($feature,true));
        
    }
        
   
}

return $feature;